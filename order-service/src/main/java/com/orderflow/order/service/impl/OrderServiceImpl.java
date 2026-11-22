package com.orderflow.order.service.impl;

import com.orderflow.common.dto.PageResponse;
import com.orderflow.common.exception.BadRequestException;
import com.orderflow.common.exception.ForbiddenException;
import com.orderflow.common.exception.ResourceNotFoundException;
import com.orderflow.common.util.CorrelationIdUtil;
import com.orderflow.order.client.ProductServiceClient;
import com.orderflow.order.client.UserServiceClient;
import com.orderflow.order.dto.request.CreateOrderRequest;
import com.orderflow.order.dto.request.OrderItemRequest;
import com.orderflow.order.dto.request.UpdateOrderStatusRequest;
import com.orderflow.order.dto.response.OrderItemResponse;
import com.orderflow.order.dto.response.OrderResponse;
import com.orderflow.order.entity.Order;
import com.orderflow.order.entity.OrderItem;
import com.orderflow.order.entity.OutboxEvent;
import com.orderflow.order.enums.OrderStatus;
import com.orderflow.order.messaging.event.OrderCancelledEvent;
import com.orderflow.order.messaging.event.OrderDeliveredEvent;
import com.orderflow.order.messaging.event.OrderShippedEvent;
import com.orderflow.order.repository.OrderRepository;
import com.orderflow.order.repository.OutboxEventRepository;
import com.orderflow.order.saga.OrderSagaOrchestrator;
import com.orderflow.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OutboxEventRepository outboxEventRepository;
    private final ProductServiceClient productServiceClient;
    private final UserServiceClient userServiceClient;
    private final OrderSagaOrchestrator sagaOrchestrator;

    private static final BigDecimal TAX_RATE = new BigDecimal("0.08"); // 8% tax

    @Override
    @Transactional
    public OrderResponse createOrder(UUID userId, CreateOrderRequest request) {
        String correlationId = CorrelationIdUtil.getCorrelationId();
        log.info("[{}] Creating order for user: {}", correlationId, userId);

        String orderNumber = generateOrderNumber();
        String addressSnapshot = userServiceClient.getAddressSnapshot(userId, request.getShippingAddressId());

        Order order = Order.builder()
                .userId(userId)
                .orderNumber(orderNumber)
                .status(OrderStatus.PENDING)
                .shippingAddressId(request.getShippingAddressId())
                .shippingAddressSnapshot(addressSnapshot)
                .notes(request.getNotes())
                .items(new ArrayList<>())
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;

        for (OrderItemRequest itemReq : request.getItems()) {
            ProductServiceClient.ProductDto product = productServiceClient.getProductById(itemReq.getProductId());
            if (!product.isActive()) {
                throw new BadRequestException("Product is no longer active: " + product.getName());
            }

            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()))
                    .setScale(2, RoundingMode.HALF_UP);
            subtotal = subtotal.add(itemTotal);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .productId(product.getId())
                    .productName(product.getName())
                    .sku(product.getSku())
                    .quantity(itemReq.getQuantity())
                    .unitPrice(product.getPrice())
                    .totalPrice(itemTotal)
                    .build();

            order.getItems().add(orderItem);
        }

        BigDecimal taxAmount = subtotal.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalAmount = subtotal.add(taxAmount);

        order.setSubtotal(subtotal);
        order.setTaxAmount(taxAmount);
        order.setTotalAmount(totalAmount);

        order = orderRepository.save(order);
        log.info("[{}] Saved pending order with ID: {} and number: {}", correlationId, order.getId(), order.getOrderNumber());

        // Kick off Saga orchestration
        sagaOrchestrator.startOrderSaga(order, correlationId);

        return toOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(UUID userId, UUID orderId, boolean isAdmin) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (!isAdmin && !order.getUserId().equals(userId)) {
            throw new ForbiddenException("Access denied: You do not have permission to view this order");
        }

        return toOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getOrdersForUser(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Order> orderPage = orderRepository.findByUserId(userId, pageable);

        List<OrderResponse> content = orderPage.getContent().stream()
                .map(this::toOrderResponse)
                .collect(Collectors.toList());

        return PageResponse.of(content, page, size, orderPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getAllOrders(OrderStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Order> orderPage = (status != null)
                ? orderRepository.findByStatus(status, pageable)
                : orderRepository.findAll(pageable);

        List<OrderResponse> content = orderPage.getContent().stream()
                .map(this::toOrderResponse)
                .collect(Collectors.toList());

        return PageResponse.of(content, page, size, orderPage.getTotalElements());
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(UUID userId, UUID orderId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (!order.getUserId().equals(userId)) {
            throw new ForbiddenException("Access denied: You can only cancel your own orders");
        }

        if (order.getStatus() != OrderStatus.PENDING &&
                order.getStatus() != OrderStatus.INVENTORY_RESERVED &&
                order.getStatus() != OrderStatus.CONFIRMED) {
            throw new BadRequestException("Order cannot be cancelled in status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelledReason(reason != null ? reason : "Cancelled by customer");
        order = orderRepository.save(order);

        String correlationId = CorrelationIdUtil.getCorrelationId();
        OrderCancelledEvent event = OrderCancelledEvent.builder()
                .orderId(order.getId())
                .userId(order.getUserId())
                .orderNumber(order.getOrderNumber())
                .reason(order.getCancelledReason())
                .build();
        event.initDefaults("OrderCancelled", order.getId().toString(), "Order", "order-service", correlationId);

        OutboxEvent outbox = OutboxEvent.builder()
                .aggregateType("Order")
                .aggregateId(order.getId())
                .eventType("OrderCancelled")
                .payload(com.orderflow.common.util.JsonUtil.toJson(event))
                .correlationId(correlationId)
                .published(false)
                .build();
        outboxEventRepository.save(outbox);

        return toOrderResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(UUID orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        OrderStatus previousStatus = order.getStatus();
        OrderStatus newStatus = request.getStatus();
        order.setStatus(newStatus);
        if (request.getNotes() != null) {
            order.setNotes(order.getNotes() != null ? order.getNotes() + " | " + request.getNotes() : request.getNotes());
        }
        order = orderRepository.save(order);
        log.info("Admin updated order {} status from {} to {}", orderId, previousStatus, newStatus);

        String correlationId = CorrelationIdUtil.getCorrelationId();

        if (newStatus == OrderStatus.SHIPPED) {
            OrderShippedEvent shippedEvent = OrderShippedEvent.builder()
                    .orderId(order.getId())
                    .userId(order.getUserId())
                    .orderNumber(order.getOrderNumber())
                    .build();
            shippedEvent.initDefaults("OrderShipped", order.getId().toString(), "Order", "order-service", correlationId);

            outboxEventRepository.save(OutboxEvent.builder()
                    .aggregateType("Order")
                    .aggregateId(order.getId())
                    .eventType("OrderShipped")
                    .payload(com.orderflow.common.util.JsonUtil.toJson(shippedEvent))
                    .correlationId(correlationId)
                    .published(false)
                    .build());
        } else if (newStatus == OrderStatus.DELIVERED) {
            OrderDeliveredEvent deliveredEvent = OrderDeliveredEvent.builder()
                    .orderId(order.getId())
                    .userId(order.getUserId())
                    .orderNumber(order.getOrderNumber())
                    .build();
            deliveredEvent.initDefaults("OrderDelivered", order.getId().toString(), "Order", "order-service", correlationId);

            outboxEventRepository.save(OutboxEvent.builder()
                    .aggregateType("Order")
                    .aggregateId(order.getId())
                    .eventType("OrderDelivered")
                    .payload(com.orderflow.common.util.JsonUtil.toJson(deliveredEvent))
                    .correlationId(correlationId)
                    .published(false)
                    .build());
        }

        return toOrderResponse(order);
    }

    private String generateOrderNumber() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String suffix = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "ORD-" + date + "-" + suffix;
    }

    private OrderResponse toOrderResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems() != null
                ? order.getItems().stream().map(this::toItemResponse).collect(Collectors.toList())
                : List.of();

        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus())
                .subtotal(order.getSubtotal())
                .taxAmount(order.getTaxAmount())
                .totalAmount(order.getTotalAmount())
                .shippingAddressId(order.getShippingAddressId())
                .shippingAddressSnapshot(order.getShippingAddressSnapshot())
                .notes(order.getNotes())
                .cancelledReason(order.getCancelledReason())
                .items(itemResponses)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    private OrderItemResponse toItemResponse(OrderItem item) {
        return OrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProductId())
                .productName(item.getProductName())
                .sku(item.getSku())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .totalPrice(item.getTotalPrice())
                .createdAt(item.getCreatedAt())
                .build();
    }
}
