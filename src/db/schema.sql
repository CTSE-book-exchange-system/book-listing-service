CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS books (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id         UUID NOT NULL,
    seller_name       VARCHAR(100) NOT NULL,
    seller_university VARCHAR(150) NOT NULL,
    title             VARCHAR(200) NOT NULL,
    author            VARCHAR(150) NOT NULL,
    isbn              VARCHAR(20),
    module_code       VARCHAR(50),
    edition           VARCHAR(50),
    condition         VARCHAR(20) NOT NULL,
    price             DECIMAL(10,2),
    description       TEXT,
    pickup_location   VARCHAR(200),
    pickup_notes      VARCHAR(300),
    status            VARCHAR(20) DEFAULT 'available',
    view_count        INT DEFAULT 0,
    created_at        TIMESTAMP DEFAULT NOW(),
    updated_at        TIMESTAMP DEFAULT NOW()
    );

CREATE INDEX IF NOT EXISTS idx_books_status      ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_module_code ON books(module_code);
CREATE INDEX IF NOT EXISTS idx_books_seller_id   ON books(seller_id);
CREATE INDEX IF NOT EXISTS idx_books_university  ON books(seller_university);