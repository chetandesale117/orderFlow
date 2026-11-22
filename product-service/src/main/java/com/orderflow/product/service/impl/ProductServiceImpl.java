package com.orderflow.product.service.impl;

import com.orderflow.common.dto.PageResponse;
import com.orderflow.common.exception.ConflictException;
import com.orderflow.common.exception.ResourceNotFoundException;
import com.orderflow.common.util.CorrelationIdUtil;
import com.orderflow.product.dto.request.ProductRequest;
import com.orderflow.product.dto.response.CategoryResponse;
import com.orderflow.product.dto.response.ProductResponse;
import com.orderflow.product.entity.Category;
import com.orderflow.product.entity.Product;
import com.orderflow.product.messaging.event.ProductCreatedEvent;
import com.orderflow.product.messaging.event.ProductUpdatedEvent;
import com.orderflow.product.messaging.producer.ProductEventProducer;
import com.orderflow.product.repository.CategoryRepository;
import com.orderflow.product.repository.ProductRepository;
import com.orderflow.product.service.ProductService;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductEventProducer productEventProducer;

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> searchProducts(
            String search, UUID categoryId, BigDecimal minPrice, BigDecimal maxPrice,
            String brand, int page, int size, String sortBy, String sortDir) {

        Sort sort = Sort.by(
                "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC,
                sortBy != null ? sortBy : "createdAt"
        );
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isTrue(root.get("isActive")));

            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("name")), pattern);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), pattern);
                Predicate skuMatch = cb.like(cb.lower(root.get("sku")), pattern);
                predicates.add(cb.or(nameMatch, descMatch, skuMatch));
            }

            if (categoryId != null) {
                Join<Product, Category> categoryJoin = root.join("categories");
                predicates.add(cb.equal(categoryJoin.get("id"), categoryId));
            }

            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            if (brand != null && !brand.trim().isEmpty()) {
                predicates.add(cb.equal(cb.lower(root.get("brand")), brand.trim().toLowerCase()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Product> productPage = productRepository.findAll(spec, pageable);
        List<ProductResponse> content = productPage.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return PageResponse.of(content, page, size, productPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "products", key = "#id")
    public ProductResponse getProductById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return toResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "slug", slug));
        return toResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        String sku = request.getSku().toUpperCase().trim();
        if (productRepository.existsBySku(sku)) {
            throw new ConflictException("Product with SKU already exists: " + sku);
        }

        String slug = request.getSlug() != null && !request.getSlug().trim().isEmpty()
                ? toSlug(request.getSlug())
                : toSlug(request.getName());

        if (productRepository.existsBySlug(slug)) {
            slug = slug + "-" + UUID.randomUUID().toString().substring(0, 8);
        }

        Set<Category> categories = new HashSet<>();
        if (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty()) {
            categories.addAll(categoryRepository.findAllById(request.getCategoryIds()));
        }

        Product product = Product.builder()
                .name(request.getName().trim())
                .slug(slug)
                .description(request.getDescription())
                .shortDescription(request.getShortDescription())
                .price(request.getPrice())
                .compareAtPrice(request.getCompareAtPrice())
                .sku(sku)
                .imageUrl(request.getImageUrl())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .weight(request.getWeight())
                .brand(request.getBrand())
                .categories(categories)
                .build();

        product = productRepository.save(product);
        log.info("Created product: {} ({}) with SKU: {}", product.getName(), product.getId(), product.getSku());

        // Publish ProductCreatedEvent
        ProductCreatedEvent event = ProductCreatedEvent.builder()
                .productId(product.getId())
                .sku(product.getSku())
                .name(product.getName())
                .price(product.getPrice())
                .build();
        event.initDefaults("ProductCreated", product.getId().toString(), "Product", "product-service", CorrelationIdUtil.getCorrelationId());
        productEventProducer.publishProductCreated(event);

        return toResponse(product);
    }

    @Override
    @Transactional
    @CacheEvict(value = "products", key = "#id")
    public ProductResponse updateProduct(UUID id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        if (request.getName() != null) product.setName(request.getName().trim());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getShortDescription() != null) product.setShortDescription(request.getShortDescription());
        if (request.getPrice() != null) product.setPrice(request.getPrice());
        if (request.getCompareAtPrice() != null) product.setCompareAtPrice(request.getCompareAtPrice());
        if (request.getImageUrl() != null) product.setImageUrl(request.getImageUrl());
        if (request.getWeight() != null) product.setWeight(request.getWeight());
        if (request.getBrand() != null) product.setBrand(request.getBrand());
        if (request.getIsActive() != null) product.setIsActive(request.getIsActive());

        if (request.getCategoryIds() != null) {
            Set<Category> categories = new HashSet<>(categoryRepository.findAllById(request.getCategoryIds()));
            product.setCategories(categories);
        }

        product = productRepository.save(product);
        log.info("Updated product: {} ({})", product.getName(), product.getId());

        // Publish ProductUpdatedEvent
        ProductUpdatedEvent event = ProductUpdatedEvent.builder()
                .productId(product.getId())
                .sku(product.getSku())
                .name(product.getName())
                .price(product.getPrice())
                .isActive(product.getIsActive())
                .build();
        event.initDefaults("ProductUpdated", product.getId().toString(), "Product", "product-service", CorrelationIdUtil.getCorrelationId());
        productEventProducer.publishProductUpdated(event);

        return toResponse(product);
    }

    @Override
    @Transactional
    @CacheEvict(value = "products", key = "#id")
    public void deleteProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        product.setIsActive(false);
        productRepository.save(product);
        log.info("Soft-deleted product: {} ({})", product.getName(), product.getId());

        ProductUpdatedEvent event = ProductUpdatedEvent.builder()
                .productId(product.getId())
                .sku(product.getSku())
                .name(product.getName())
                .price(product.getPrice())
                .isActive(false)
                .build();
        event.initDefaults("ProductUpdated", product.getId().toString(), "Product", "product-service", CorrelationIdUtil.getCorrelationId());
        productEventProducer.publishProductUpdated(event);
    }

    private ProductResponse toResponse(Product product) {
        Set<CategoryResponse> categoryResponses = product.getCategories() != null
                ? product.getCategories().stream().map(c -> CategoryResponse.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .slug(c.getSlug())
                        .build()).collect(Collectors.toSet())
                : Set.of();

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .shortDescription(product.getShortDescription())
                .price(product.getPrice())
                .compareAtPrice(product.getCompareAtPrice())
                .sku(product.getSku())
                .imageUrl(product.getImageUrl())
                .isActive(product.getIsActive())
                .weight(product.getWeight())
                .brand(product.getBrand())
                .categories(categoryResponses)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    private String toSlug(String input) {
        String nowhitespace = WHITESPACE.matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH);
    }
}
