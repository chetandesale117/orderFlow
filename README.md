# OrderFlow — E-Commerce Microservices Platform

OrderFlow is a production-grade, event-driven e-commerce microservices platform built with **Java 21**, **Spring Boot 3.3.6**, **Spring Cloud Gateway**, and **Apache Kafka**.

---

## 🏗 Architecture & Services

The platform consists of **8 Spring Boot microservices**, communicating via REST and Apache Kafka with an **orchestrated Saga** for distributed transactions:

- **API Gateway (8080)**: Spring Cloud Gateway (reactive), RS256 JWT validation, Redis rate-limiting, and correlation ID injection.
- **Auth Service (8081)**: PostgreSQL (`auth_db`), RS256 asymmetric JWT generation, refresh token rotation with family revocation detection, BCrypt password hashing.
- **User Service (8082)**: PostgreSQL (`user_db`), customer profile management, address book, consumes `UserRegistered` event.
- **Product Service (8083)**: PostgreSQL (`product_db`), product catalog, category hierarchy, Redis caching with eviction.
- **Inventory Service (8084)**: PostgreSQL (`inventory_db`), stock reservations with `@Version` optimistic locking, transactional outbox pattern.
- **Order Service (8085)**: PostgreSQL (`order_db`), order lifecycle and **Distributed Saga Orchestrator** across inventory and payment.
- **Payment Service (8086)**: PostgreSQL (`payment_db`), sandbox payment processing simulation, HMAC-SHA256 verified webhooks, idempotency key enforcement.
- **Notification Service (8087)**: MongoDB (`notification_db`), HTML email template rendering (Thymeleaf), email dispatch via Mailpit SMTP.
- **Frontend SPA (`orderflow-web` :5173 / :3001)**: React 18, Vite, TanStack Query v5, Zustand v4, Tailwind CSS, Framer Motion, dark glassmorphism UI, client-side cart, real-time Saga timeline state machine, and comprehensive Admin Operations Console.

---

## 🚀 Getting Started

### 1. Launch with Docker Compose
```bash
# Start all 8 microservices, frontend SPA, databases, messaging, and observability
docker compose up -d --build
```
Frontend Web SPA is accessible at: **http://localhost:3001**

### 2. Local Frontend Development
```bash
cd orderflow-web
npm install
npm run dev
```
Local dev server starts on **http://localhost:5173** with automatic `/api` proxy to API Gateway (`:8080`).

### 3. Verify Health
All services can be verified through Actuator health checks:
```bash
curl http://localhost:8080/actuator/health
```

---

## ⚡ Quick Testing (Curl Flow)

### 1. Register a Customer
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "Password123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```
*Response includes access token, refresh token, and user details.*

### 2. Login
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "Password123!"
  }'
```

### 3. Create Product (Admin)
```bash
curl -X POST http://localhost:8080/api/v1/admin/products \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mechanical Keyboard",
    "sku": "KB-MECH-01",
    "price": 99.99,
    "description": "Custom mechanical keyboard with tactile switches"
  }'
```

### 4. Create Order & Run Saga
```bash
curl -X POST http://localhost:8080/api/v1/orders \
  -H "Authorization: Bearer <CUSTOMER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "<PRODUCT_UUID>",
        "quantity": 1
      }
    ],
    "shippingAddressId": "<ADDRESS_UUID>"
  }'
```

---

## 📊 Observability & Monitoring
- **API Gateway**: `http://localhost:8080`
- **Mailpit Web UI**: `http://localhost:8025`
- **Prometheus**: `http://localhost:9090`
- **Grafana Dashboards**: `http://localhost:3000` (User: `admin`, Pass: `admin`)
- **Zipkin Distributed Tracing**: `http://localhost:9411`
