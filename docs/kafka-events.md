# OrderFlow Kafka Event Catalog

## Topics
| Topic Name | Partitions | Producer | Consumers |
|---|---|---|---|
| `orderflow.auth.user-registered` | 3 | `auth-service` | `user-service`, `notification-service` |
| `orderflow.product.product-created` | 3 | `product-service` | `inventory-service` |
| `orderflow.product.product-updated` | 3 | `product-service` | `inventory-service` |
| `orderflow.order.order-created` | 6 | `order-service` | `inventory-service` |
| `orderflow.order.payment-initiated` | 6 | `order-service` | `payment-service` |
| `orderflow.order.order-confirmed` | 6 | `order-service` | `inventory-service`, `notification-service` |
| `orderflow.order.order-cancelled` | 6 | `order-service` | `inventory-service`, `notification-service` |
| `orderflow.order.stock-release-requested` | 6 | `order-service` | `inventory-service` |
| `orderflow.order.order-shipped` | 3 | `order-service` | `notification-service` |
| `orderflow.order.order-delivered` | 3 | `order-service` | `notification-service` |
| `orderflow.inventory.stock-reserved` | 6 | `inventory-service` | `order-service` |
| `orderflow.inventory.stock-reservation-failed` | 3 | `inventory-service` | `order-service` |
| `orderflow.inventory.stock-released` | 6 | `inventory-service` | `order-service` |
| `orderflow.payment.payment-succeeded` | 6 | `payment-service` | `order-service`, `notification-service` |
| `orderflow.payment.payment-failed` | 3 | `payment-service` | `order-service`, `notification-service` |
| `orderflow.payment.refund-completed` | 3 | `payment-service` | `order-service`, `notification-service` |

## Transactional Outbox Pattern
Services publishing events do not send directly to Kafka within the business transaction. Instead, events are stored in `outbox_events` in the same database transaction. An asynchronous background scheduler polls unpublished events every 500ms and pushes them to Kafka with at-least-once delivery semantics.
