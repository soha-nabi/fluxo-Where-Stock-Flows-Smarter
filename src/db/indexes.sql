-- ====================================================================
-- FLUXO Database Indexing & Query Performance Optimization Script
-- Target DBMS: PostgreSQL / CockroachDB
-- Purpose: Accelerate query execution times, eliminate N+1 queries, 
--          and speed up dashboard aggregation & paginated catalog views.
-- ====================================================================

-- 1. PRODUCTS TABLE INDEXES
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(to_tsvector('english', name || ' ' || sku));

-- 2. STOCK & INVENTORY INDEXES
CREATE INDEX IF NOT EXISTS idx_stock_product_id ON stock(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_warehouse_id ON stock(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_location_id ON stock(location_id);
CREATE INDEX IF NOT EXISTS idx_stock_product_warehouse ON stock(product_id, warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_quantity_low ON stock(quantity) WHERE quantity <= 10;

-- 3. RECEIPTS & RECEIPT ITEMS INDEXES
CREATE INDEX IF NOT EXISTS idx_receipts_warehouse_status ON receipts(warehouse_id, status);
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON receipts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_receipt_items_receipt_id ON receipt_items(receipt_id);
CREATE INDEX IF NOT EXISTS idx_receipt_items_product_id ON receipt_items(product_id);

-- 4. DELIVERIES & DELIVERY ITEMS INDEXES
CREATE INDEX IF NOT EXISTS idx_deliveries_warehouse_status ON deliveries(warehouse_id, status);
CREATE INDEX IF NOT EXISTS idx_deliveries_created_at ON deliveries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_delivery_items_delivery_id ON delivery_items(delivery_id);
CREATE INDEX IF NOT EXISTS idx_delivery_items_product_id ON delivery_items(product_id);

-- 5. TRANSFERS & ADJUSTMENTS INDEXES
CREATE INDEX IF NOT EXISTS idx_transfers_status_date ON transfers(status, initiated_date DESC);
CREATE INDEX IF NOT EXISTS idx_transfers_from_to ON transfers(from_warehouse_id, to_warehouse_id);
CREATE INDEX IF NOT EXISTS idx_adjustments_warehouse_status ON adjustments(warehouse_id, status);
CREATE INDEX IF NOT EXISTS idx_adjustments_created_at ON adjustments(created_at DESC);

-- 6. STOCK LEDGER AUDIT TRAIL INDEXES
CREATE INDEX IF NOT EXISTS idx_ledger_product_date ON stock_ledger(product_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_warehouse_date ON stock_ledger(warehouse_id, date DESC);

-- 7. DASHBOARD AGGREGATED VIEW (Eager Materialized View for 0ms KPI Loads)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_dashboard_kpis AS
SELECT 
    COUNT(DISTINCT p.id) AS total_products,
    COALESCE(SUM(s.quantity), 0) AS total_stock_quantity,
    COUNT(DISTINCT CASE WHEN s.quantity <= p.reorder_level THEN p.id END) AS low_stock_count,
    COUNT(DISTINCT CASE WHEN s.quantity = 0 THEN p.id END) AS out_of_stock_count
FROM products p
LEFT JOIN stock s ON p.id = s.product_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_dashboard_kpis ON mv_dashboard_kpis(total_products);
