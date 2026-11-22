CREATE TABLE IF NOT EXISTS orders (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                     UUID NOT NULL,
    order_number                VARCHAR(30) NOT NULL UNIQUE,
    status                      VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    subtotal                    DECIMAL(12,2) NOT NULL,
    tax_amount                  DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount                DECIMAL(12,2) NOT NULL,
    shipping_address_id         UUID,
    shipping_address_snapshot   TEXT,
    notes                       TEXT,
    cancelled_reason            TEXT,
    created_at                  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL,
    product_name    VARCHAR(255) NOT NULL,
    sku             VARCHAR(50) NOT NULL,
    quantity        INT NOT NULL,
    unit_price      DECIMAL(12,2) NOT NULL,
    total_price     DECIMAL(12,2) NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saga_instances (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    saga_type       VARCHAR(50) NOT NULL DEFAULT 'ORDER_CREATION',
    current_step    VARCHAR(50) NOT NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'STARTED',
    payload         TEXT,
    retry_count     INT NOT NULL DEFAULT 0,
    max_retries     INT NOT NULL DEFAULT 3,
    timeout_at      TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saga_steps (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    saga_id                 UUID NOT NULL REFERENCES saga_instances(id) ON DELETE CASCADE,
    step_name               VARCHAR(50) NOT NULL,
    status                  VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    request_payload         TEXT,
    response_payload        TEXT,
    compensation_payload    TEXT,
    error_message           TEXT,
    started_at              TIMESTAMP,
    completed_at            TIMESTAMP,
    created_at              TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS outbox_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_type  VARCHAR(100) NOT NULL,
    aggregate_id    UUID NOT NULL,
    event_type      VARCHAR(100) NOT NULL,
    payload         TEXT NOT NULL,
    correlation_id  VARCHAR(100),
    published       BOOLEAN NOT NULL DEFAULT FALSE,
    published_at    TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_saga_instances_status ON saga_instances(status);
CREATE INDEX IF NOT EXISTS idx_order_outbox_unpublished ON outbox_events(published, created_at) WHERE published = FALSE;
