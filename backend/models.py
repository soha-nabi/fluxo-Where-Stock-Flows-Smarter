"""
Fluxo Production Inventory Management System - Database Models
SQLAlchemy ORM Models supporting end-to-end inventory workflows, receipts, 
deliveries, internal transfers, adjustments, and an append-only stock ledger.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    UniqueConstraint,
    CheckConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.ext.hybrid import hybrid_property
from database import Base


def utc_now():
    """Return timezone-aware current UTC time."""
    return datetime.now(timezone.utc)


def generate_uuid():
    """Generate a string representation of a random UUID4."""
    return str(uuid.uuid4())


# ==========================================
# 1. Product Model
# ==========================================
class Product(Base):
    """
    Represents an inventory item/SKU in the Fluxo system.
    """

    __tablename__ = "products"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    sku = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    category = Column(
        String(50),
        nullable=False,
        default="MATERIALS",
        comment="Enum: MATERIALS, ELECTRONICS, FURNITURE, TOOLS, OTHER",
    )
    unit_of_measure = Column(String(20), nullable=False, default="units")
    reorder_level = Column(Integer, nullable=False, default=10)
    description = Column(String(500), nullable=True)
    image_url = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    # Relationships
    stocks = relationship("Stock", back_populates="product", cascade="all, delete-orphan")
    receipt_items = relationship("ReceiptItem", back_populates="product")
    delivery_items = relationship("DeliveryItem", back_populates="product")
    transfers = relationship("InternalTransfer", back_populates="product")
    adjustments = relationship("StockAdjustment", back_populates="product")
    ledger_entries = relationship("StockLedger", back_populates="product")

    __table_args__ = (
        UniqueConstraint("sku", name="uq_products_sku"),
        Index("idx_products_sku_category", "sku", "category"),
    )


# ==========================================
# 2. Warehouse Model
# ==========================================
class Warehouse(Base):
    """
    Represents a physical fulfillment hub or warehouse facility.
    """

    __tablename__ = "warehouses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, nullable=False)
    code = Column(String(20), unique=True, index=True, nullable=False)
    address = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    capacity = Column(Integer, nullable=False, default=10000)
    manager_id = Column(String(36), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    locations = relationship("Location", back_populates="warehouse", cascade="all, delete-orphan")
    stocks = relationship("Stock", back_populates="warehouse", cascade="all, delete-orphan")
    receipts = relationship("Receipt", back_populates="warehouse")
    deliveries = relationship("Delivery", back_populates="warehouse")

    __table_args__ = (
        UniqueConstraint("code", "name", name="uq_warehouses_code_name"),
        Index("idx_warehouses_code", "code"),
    )


# ==========================================
# 3. Location Model
# ==========================================
class Location(Base):
    """
    Represents a specific bin, rack, or shelf location within a warehouse.
    """

    __tablename__ = "locations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    warehouse_id = Column(
        String(36), ForeignKey("warehouses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name = Column(String(100), nullable=False)
    code = Column(String(50), nullable=False)
    location_type = Column(
        String(30),
        nullable=False,
        default="SHELF",
        comment="Enum: RACK, SHELF, BIN, FLOOR, FREEZER",
    )
    capacity = Column(Integer, nullable=False, default=500)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    warehouse = relationship("Warehouse", back_populates="locations")
    stocks = relationship("Stock", back_populates="location", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("warehouse_id", "code", name="uq_locations_wh_code"),
        Index("idx_locations_warehouse_id", "warehouse_id"),
    )


# ==========================================
# 4. Stock Model
# ==========================================
class Stock(Base):
    """
    Tracks inventory quantity per product, warehouse, and specific bin location.
    """

    __tablename__ = "stocks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_id = Column(
        String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True
    )
    warehouse_id = Column(
        String(36), ForeignKey("warehouses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    location_id = Column(
        String(36), ForeignKey("locations.id", ondelete="CASCADE"), nullable=True
    )
    quantity = Column(Integer, nullable=False, default=0)
    quantity_reserved = Column(Integer, nullable=False, default=0)
    last_counted_at = Column(DateTime(timezone=True), nullable=True)
    last_updated = Column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    # Relationships
    product = relationship("Product", back_populates="stocks")
    warehouse = relationship("Warehouse", back_populates="stocks")
    location = relationship("Location", back_populates="stocks")

    @hybrid_property
    def quantity_available(self) -> int:
        """Computed property: quantity minus reserved stock."""
        return max(0, self.quantity - self.quantity_reserved)

    __table_args__ = (
        UniqueConstraint("product_id", "warehouse_id", "location_id", name="uq_stock_prod_wh_loc"),
        Index("idx_stock_product_warehouse", "product_id", "warehouse_id"),
        CheckConstraint("quantity >= 0", name="chk_stock_quantity_non_negative"),
    )


# ==========================================
# 5. Supplier Model
# ==========================================
class Supplier(Base):
    """
    Represents a vendor or supplier for incoming stock receipts.
    """

    __tablename__ = "suppliers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, index=True, nullable=False)
    contact_email = Column(String(100), nullable=True)
    contact_phone = Column(String(30), nullable=True)
    address = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    lead_time_days = Column(Integer, nullable=False, default=7)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    receipts = relationship("Receipt", back_populates="supplier")

    __table_args__ = (Index("idx_suppliers_name", "name"),)


# ==========================================
# 6. Receipt Model (Incoming Stock)
# ==========================================
class Receipt(Base):
    """
    Tracks incoming shipments and purchase orders from suppliers.
    """

    __tablename__ = "receipts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    supplier_id = Column(String(36), ForeignKey("suppliers.id"), nullable=False)
    warehouse_id = Column(String(36), ForeignKey("warehouses.id"), nullable=False)
    receipt_number = Column(String(50), unique=True, nullable=False)
    status = Column(
        String(30),
        nullable=False,
        default="DRAFT",
        comment="Enum: DRAFT, RECEIVED, VALIDATED, COMPLETED",
    )
    expected_date = Column(DateTime(timezone=True), nullable=False)
    received_date = Column(DateTime(timezone=True), nullable=True)
    total_items = Column(Integer, nullable=False, default=0)
    notes = Column(String(500), nullable=True)
    created_by = Column(String(100), nullable=False, default="System")
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    # Relationships
    supplier = relationship("Supplier", back_populates="receipts")
    warehouse = relationship("Warehouse", back_populates="receipts")
    items = relationship("ReceiptItem", back_populates="receipt", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("receipt_number", name="uq_receipt_number"),
        Index("idx_receipts_status_warehouse", "status", "warehouse_id"),
    )


# ==========================================
# 7. ReceiptItem Model
# ==========================================
class ReceiptItem(Base):
    """
    Line items associated with an incoming stock receipt.
    """

    __tablename__ = "receipt_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    receipt_id = Column(
        String(36), ForeignKey("receipts.id", ondelete="CASCADE"), nullable=False
    )
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    quantity_expected = Column(Integer, nullable=False)
    quantity_received = Column(Integer, nullable=True, default=None)
    unit_price = Column(Float, nullable=True)
    received_at = Column(DateTime(timezone=True), nullable=True)
    is_accepted = Column(Boolean, nullable=True, default=None)
    notes = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    receipt = relationship("Receipt", back_populates="items")
    product = relationship("Product", back_populates="receipt_items")


# ==========================================
# 8. Delivery Model (Outgoing Stock)
# ==========================================
class Delivery(Base):
    """
    Tracks outgoing customer orders and sales dispatches.
    """

    __tablename__ = "deliveries"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    delivery_number = Column(String(50), unique=True, nullable=False)
    customer_id = Column(String(100), nullable=False)
    warehouse_id = Column(String(36), ForeignKey("warehouses.id"), nullable=False)
    status = Column(
        String(30),
        nullable=False,
        default="DRAFT",
        comment="Enum: DRAFT, PICKING, PICKED, PACKING, PACKED, SHIPPED, DELIVERED, CANCELED",
    )
    order_date = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    planned_delivery_date = Column(DateTime(timezone=True), nullable=False)
    actual_delivery_date = Column(DateTime(timezone=True), nullable=True)
    notes = Column(String(500), nullable=True)
    created_by = Column(String(100), nullable=False, default="System")
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    # Relationships
    warehouse = relationship("Warehouse", back_populates="deliveries")
    items = relationship("DeliveryItem", back_populates="delivery", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("delivery_number", name="uq_delivery_number"),
        Index("idx_deliveries_status_warehouse", "status", "warehouse_id"),
    )


# ==========================================
# 9. DeliveryItem Model
# ==========================================
class DeliveryItem(Base):
    """
    Line items associated with an outgoing delivery dispatch.
    """

    __tablename__ = "delivery_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    delivery_id = Column(
        String(36), ForeignKey("deliveries.id", ondelete="CASCADE"), nullable=False
    )
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    quantity_ordered = Column(Integer, nullable=False)
    quantity_picked = Column(Integer, nullable=True, default=0)
    quantity_packed = Column(Integer, nullable=True, default=0)
    quantity_shipped = Column(Integer, nullable=True, default=0)
    unit_price = Column(Float, nullable=True)
    status = Column(
        String(30),
        nullable=False,
        default="PENDING",
        comment="Enum: PENDING, PICKED, PACKED, SHIPPED",
    )
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    delivery = relationship("Delivery", back_populates="items")
    product = relationship("Product", back_populates="delivery_items")


# ==========================================
# 10. InternalTransfer Model
# ==========================================
class InternalTransfer(Base):
    """
    Tracks inventory movements between warehouses or internal bin locations.
    """

    __tablename__ = "internal_transfers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    transfer_number = Column(String(50), unique=True, nullable=False)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    from_warehouse_id = Column(
        String(36), ForeignKey("warehouses.id"), nullable=False, index=True
    )
    to_warehouse_id = Column(
        String(36), ForeignKey("warehouses.id"), nullable=False, index=True
    )
    from_location_id = Column(String(36), ForeignKey("locations.id"), nullable=True)
    to_location_id = Column(String(36), ForeignKey("locations.id"), nullable=True)
    quantity = Column(Integer, nullable=False)
    status = Column(
        String(30),
        nullable=False,
        default="PENDING",
        comment="Enum: PENDING, IN_TRANSIT, COMPLETED, CANCELED",
    )
    initiated_date = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    completed_date = Column(DateTime(timezone=True), nullable=True)
    created_by = Column(String(100), nullable=False, default="System")
    notes = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    # Relationships
    product = relationship("Product", back_populates="transfers")

    __table_args__ = (
        UniqueConstraint("transfer_number", name="uq_transfer_number"),
        Index("idx_transfers_status_warehouses", "status", "from_warehouse_id", "to_warehouse_id"),
    )


# ==========================================
# 11. StockAdjustment Model
# ==========================================
class StockAdjustment(Base):
    """
    Tracks inventory reconciliations, cycle count adjustments, and write-offs.
    """

    __tablename__ = "stock_adjustments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    adjustment_number = Column(String(50), unique=True, nullable=False)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    warehouse_id = Column(String(36), ForeignKey("warehouses.id"), nullable=False)
    location_id = Column(String(36), ForeignKey("locations.id"), nullable=True)
    quantity_before = Column(Integer, nullable=False)
    quantity_after = Column(Integer, nullable=False)
    reason = Column(
        String(50),
        nullable=False,
        default="RECOUNT",
        comment="Enum: DAMAGED, LOST, MISCOUNT, RECOUNT, THEFT, EXPIRATION, OTHER",
    )
    status = Column(
        String(30),
        nullable=False,
        default="DRAFT",
        comment="Enum: DRAFT, PENDING_APPROVAL, APPROVED, EXECUTED, REJECTED",
    )
    notes = Column(String(500), nullable=True)
    created_by = Column(String(100), nullable=False, default="System")
    approved_by = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    # Relationships
    product = relationship("Product", back_populates="adjustments")

    @hybrid_property
    def quantity_diff(self) -> int:
        """Computed property: difference after minus before."""
        return self.quantity_after - self.quantity_before

    __table_args__ = (
        UniqueConstraint("adjustment_number", name="uq_adjustment_number"),
        Index("idx_adjustments_status_warehouse", "status", "warehouse_id"),
    )


# ==========================================
# 12. StockLedger Model (Immutable Audit Trail)
# ==========================================
class StockLedger(Base):
    """
    Append-only immutable audit trail recording every inventory balance mutation.
    """

    __tablename__ = "stock_ledger"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    warehouse_id = Column(String(36), ForeignKey("warehouses.id"), nullable=False)
    location_id = Column(String(36), ForeignKey("locations.id"), nullable=True)
    operation_type = Column(
        String(30),
        nullable=False,
        comment="Enum: RECEIPT, DELIVERY, TRANSFER_OUT, TRANSFER_IN, ADJUSTMENT, COUNT, INITIAL",
    )
    quantity_before = Column(Integer, nullable=False)
    quantity_after = Column(Integer, nullable=False)
    reference_type = Column(
        String(30),
        nullable=False,
        comment="Enum: RECEIPT, DELIVERY, TRANSFER, ADJUSTMENT, MANUAL",
    )
    reference_id = Column(String(36), nullable=False)
    reference_number = Column(String(50), nullable=False)
    notes = Column(String(500), nullable=True)
    created_by = Column(String(100), nullable=False, default="System")
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    product = relationship("Product", back_populates="ledger_entries")

    @hybrid_property
    def quantity_change(self) -> int:
        """Computed property: change in quantity after minus before."""
        return self.quantity_after - self.quantity_before

    __table_args__ = (
        Index("idx_ledger_prod_wh_created", "product_id", "warehouse_id", "created_at"),
    )
