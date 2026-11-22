-- Initialize all microservice databases in PostgreSQL
CREATE DATABASE auth_db;
CREATE DATABASE user_db;
CREATE DATABASE product_db;
CREATE DATABASE inventory_db;
CREATE DATABASE order_db;
CREATE DATABASE payment_db;

GRANT ALL PRIVILEGES ON DATABASE auth_db TO orderflow;
GRANT ALL PRIVILEGES ON DATABASE user_db TO orderflow;
GRANT ALL PRIVILEGES ON DATABASE product_db TO orderflow;
GRANT ALL PRIVILEGES ON DATABASE inventory_db TO orderflow;
GRANT ALL PRIVILEGES ON DATABASE order_db TO orderflow;
GRANT ALL PRIVILEGES ON DATABASE payment_db TO orderflow;
