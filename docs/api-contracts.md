# OrderFlow API Contracts

All endpoints are accessed through the API Gateway at `http://localhost:8080`.

## Standard Response Envelope
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "errors": null,
  "timestamp": "2026-11-13T12:00:00Z",
  "path": "/api/v1/...",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Authentication Endpoints (`/api/v1/auth`)
- `POST /api/v1/auth/register`: Register new user
- `POST /api/v1/auth/login`: Login user (returns JWT access token and refresh token)
- `POST /api/v1/auth/refresh`: Rotate refresh token
- `POST /api/v1/auth/logout`: Revoke active session tokens
- `GET /api/v1/auth/me`: Current user information
- `POST /api/v1/auth/admin/users`: Create an admin user

## User & Profile Endpoints (`/api/v1/users`)
- `GET /api/v1/users/me`: Get profile
- `PUT /api/v1/users/me`: Update profile
- `GET /api/v1/users/me/addresses`: List saved addresses
- `POST /api/v1/users/me/addresses`: Add new address
- `PUT /api/v1/users/me/addresses/{id}`: Update address
- `DELETE /api/v1/users/me/addresses/{id}`: Delete address
- `GET /api/v1/admin/users`: List all registered profiles (admin)

## Product Catalog Endpoints (`/api/v1/products`)
- `GET /api/v1/products`: Search & filter catalog
- `GET /api/v1/products/{id}`: Product details
- `GET /api/v1/products/slug/{slug}`: Product by slug
- `GET /api/v1/categories`: List categories
- `POST /api/v1/admin/products`: Create product (admin)
- `PUT /api/v1/admin/products/{id}`: Update product (admin)
- `DELETE /api/v1/admin/products/{id}`: Deactivate product (admin)

## Inventory Endpoints (`/api/v1/inventory`)
- `GET /api/v1/inventory/{productId}`: Stock level
- `GET /api/v1/inventory/batch?productIds=id1,id2`: Batch stock levels
- `PUT /api/v1/admin/inventory/{productId}`: Update inventory (admin)
- `POST /api/v1/admin/inventory`: Initialize inventory (admin)

## Order Endpoints (`/api/v1/orders`)
- `POST /api/v1/orders`: Create order & initiate Saga
- `GET /api/v1/orders`: Order history for current user
- `GET /api/v1/orders/{id}`: Order details
- `POST /api/v1/orders/{id}/cancel`: Cancel order
- `GET /api/v1/admin/orders`: List all orders (admin)
- `PUT /api/v1/admin/orders/{id}/status`: Update order fulfillment status (admin)

## Payment Endpoints (`/api/v1/payments`)
- `GET /api/v1/payments/order/{orderId}`: Payment record for order
- `POST /api/v1/payments/webhook`: Payment processor webhook callback
- `POST /api/v1/admin/payments/{id}/refund`: Issue refund (admin)
- `GET /api/v1/admin/payments`: List payments (admin)

## Notification Endpoints (`/api/v1/notifications`)
- `GET /api/v1/notifications`: Current user notifications history
- `GET /api/v1/notifications/{id}`: Notification detail
- `GET /api/v1/admin/notifications`: List all notifications (admin)
