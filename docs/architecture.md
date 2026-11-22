# OrderFlow Platform Architecture

## Overview
OrderFlow is an enterprise-grade e-commerce microservices platform built with **Java 21**, **Spring Boot 3.3.6**, **Spring Cloud Gateway**, and **Apache Kafka**.

## Microservices Topology
| Service | Port | Database | Primary Purpose |
|---|---|---|---|
| **API Gateway** | 8080 | None (Redis cache) | Reactive entrypoint, RS256 token verification, rate limiting |
| **Auth Service** | 8081 | PostgreSQL (`auth_db`) | RS256 JWT issuance, refresh token rotation with family revocation |
| **User Service** | 8082 | PostgreSQL (`user_db`) | Customer profiles, address book |
| **Product Service** | 8083 | PostgreSQL (`product_db`) | Catalog, categories, Redis query caching |
| **Inventory Service** | 8084 | PostgreSQL (`inventory_db`) | Stock reservations, optimistic locking, outbox pattern |
| **Order Service** | 8085 | PostgreSQL (`order_db`) | Orders & Saga Distributed Transaction Orchestrator |
| **Payment Service** | 8086 | PostgreSQL (`payment_db`) | Sandbox payment processor, HMAC-SHA256 webhook validation |
| **Notification Service** | 8087 | MongoDB (`notification_db`) | HTML template rendering, email dispatch via SMTP (Mailpit) |

## Distributed Transactions: Saga Pattern
Order creation follows an orchestrated Saga coordinated by `order-service`:
1. `Client` posts order to API Gateway.
2. `order-service` validates products & customer address, creates order with `PENDING` status, initiates `SagaInstance`, and writes `OrderCreated` event to `outbox_events`.
3. `inventory-service` consumes `OrderCreated`:
   - If stock available: reserves items atomically with `@Version` optimistic locking, writes `StockReserved` to outbox.
   - If stock unavailable: writes `StockReservationFailed` to outbox.
4. `order-service` consumes `StockReserved`, transitions Saga to `PAYMENT_PROCESSING`, and writes `PaymentInitiated` event to outbox.
5. `payment-service` consumes `PaymentInitiated`, charges via sandbox provider:
   - On success: updates payment to `SUCCEEDED`, writes `PaymentSucceeded` to outbox.
   - On failure: updates payment to `FAILED`, writes `PaymentFailed` to outbox.
6. `order-service` consumes result:
   - If `PaymentSucceeded`: confirms order (`CONFIRMED`), writes `OrderConfirmed` to outbox (notifies customer).
   - If `PaymentFailed`: transitions to `COMPENSATING`, writes `StockReleaseRequested` to outbox.
7. `inventory-service` consumes `StockReleaseRequested`, releases reserved stock, writes `StockReleased` to outbox.
8. `order-service` consumes `StockReleased`, marks order as `FAILED`, writes `OrderCancelled` to outbox.
