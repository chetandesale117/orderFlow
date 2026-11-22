CREATE TABLE IF NOT EXISTS inventory (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id          UUID NOT NULL UNIQUE,
    sku                 VARCHAR(50) NOT NULL UNIQUE,
    total_quantity      INT NOT NULL DEFAULT 0,
    reserved_quantity   INT NOT NULL DEFAULT 0,
    version             BIGINT NOT NULL DEFAULT 0,
    reorder_level       INT NOT NULL DEFAULT 10,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_quantity CHECK (total_quantity >= 0),
    CONSTRAINT chk_reserved CHECK (reserved_quantity >= 0),
    CONSTRAINT chk_available CHECK (total_quantity >= reserved_quantity)
);

CREATE TABLE IF NOT EXISTS stock_reservations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL,
    product_id      UUID NOT NULL,
    quantity        INT NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'RESERVED',
    expires_at      TIMESTAMP NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
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

CREATE INDEX IF NOT EXISTS idx_stock_reservations_order_id ON stock_reservations(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_outbox_unpublished ON outbox_events(published, created_at) WHERE published = FALSE;
