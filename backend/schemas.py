from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Any
from datetime import datetime

# --- Generic Response Wrapper ---
class ApiResponse(BaseModel):
    status: str = "success"
    data: Optional[Any] = None
    message: str = "Operation completed successfully"
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# --- Product Schemas ---
class WarehouseStockSummary(BaseModel):
    warehouse: str
    quantity: int
    low_stock: bool

class ProductBase(BaseModel):
    sku: str = Field(..., min_length=2, max_length=50)
    name: str = Field(..., min_length=2, max_length=150)
    category: str = Field("MATERIALS", description="MATERIALS, ELECTRONICS, FURNITURE, TOOLS, OTHER")
    unit: str = Field("units", alias="unit_of_measure")
    reorder_level: int = 10
    description: Optional[str] = None
    image_url: Optional[str] = None

class ProductCreate(BaseModel):
    sku: str = Field(..., min_length=2, max_length=50)
    name: str = Field(..., min_length=2, max_length=150)
    category: str = "MATERIALS"
    unit: str = "units"
    reorder_level: int = 10
    description: Optional[str] = None
    image_url: Optional[str] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    reorder_level: Optional[int] = None
    description: Optional[str] = None
    image_url: Optional[str] = None

class ProductDetailOut(BaseModel):
    id: str
    sku: str
    name: str
    category: str
    unit: str
    reorder_level: int
    total_stock: int
    warehouses: List[WarehouseStockSummary]
    description: Optional[str] = None
    image_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Warehouse Schemas ---
class WarehouseBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    code: str = Field(..., min_length=3, max_length=10)
    address: Optional[str] = None
    city: Optional[str] = None
    capacity: int = 10000

class WarehouseCreate(WarehouseBase):
    pass

class WarehouseUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    capacity: Optional[int] = None
    is_active: Optional[bool] = None

class WarehouseMetricsOut(BaseModel):
    id: str
    name: str
    code: str
    city: Optional[str] = None
    capacity: int
    sku_count: int
    capacity_utilization: float
    health_score: int
    is_active: bool

# --- Location Schemas ---
class LocationBase(BaseModel):
    name: str
    code: str
    location_type: str = "SHELF"
    capacity: int = 500

class LocationCreate(LocationBase):
    pass

class LocationUpdate(BaseModel):
    name: Optional[str] = None
    capacity: Optional[int] = None
    is_active: Optional[bool] = None

class LocationOut(LocationBase):
    id: str
    warehouse_id: str
    is_active: bool
    current_stock_quantity: int = 0

# --- Stock Schemas ---
class StockInitCreate(BaseModel):
    product_id: str
    warehouse_id: str
    location_id: Optional[str] = None
    quantity: int = Field(..., ge=0)

class StockLocationBreakdown(BaseModel):
    name: str
    quantity: int

class StockDetailOut(BaseModel):
    product_id: str
    product_name: str
    warehouse_id: str
    warehouse_name: str
    quantity: int
    quantity_reserved: int
    quantity_available: int
    low_stock: bool
    reorder_level: int
    locations: List[StockLocationBreakdown]
    last_counted_at: Optional[datetime] = None

class StockUpdateLocation(BaseModel):
    location_id: str

# --- Receipts Schemas ---
class ReceiptItemInput(BaseModel):
    product_id: str
    quantity_expected: int = Field(..., gt=0)
    unit_price: Optional[float] = None

class ReceiptCreate(BaseModel):
    supplier_id: str
    warehouse_id: str
    items: List[ReceiptItemInput]
    notes: Optional[str] = None

class ReceiptReceiveInput(BaseModel):
    receipt_item_id: str
    quantity_received: int = Field(..., ge=0)

class ReceiptOutItem(BaseModel):
    id: str
    product_id: str
    product_name: Optional[str] = None
    quantity_expected: int
    quantity_received: Optional[int] = None
    unit_price: Optional[float] = None
    received_at: Optional[datetime] = None
    is_accepted: Optional[bool] = None

class ReceiptOut(BaseModel):
    id: str
    receipt_number: str
    supplier_id: str
    supplier_name: Optional[str] = None
    warehouse_id: str
    warehouse_name: Optional[str] = None
    status: str
    expected_date: datetime
    received_date: Optional[datetime] = None
    total_items: int
    notes: Optional[str] = None
    created_by: str
    created_at: datetime
    items: List[ReceiptOutItem] = []

# --- Deliveries Schemas ---
class DeliveryItemInput(BaseModel):
    product_id: str
    quantity_ordered: int = Field(..., gt=0)
    unit_price: Optional[float] = None

class DeliveryCreate(BaseModel):
    customer_id: str
    warehouse_id: str
    items: List[DeliveryItemInput]
    notes: Optional[str] = None

class DeliveryPickInput(BaseModel):
    delivery_item_id: str
    quantity_picked: int = Field(..., ge=0)

class DeliveryPackInput(BaseModel):
    delivery_item_id: str
    quantity_packed: int = Field(..., ge=0)

class DeliveryOutItem(BaseModel):
    id: str
    product_id: str
    product_name: Optional[str] = None
    quantity_ordered: int
    quantity_picked: Optional[int] = 0
    quantity_packed: Optional[int] = 0
    quantity_shipped: Optional[int] = 0
    status: str

class DeliveryOut(BaseModel):
    id: str
    delivery_number: str
    customer_id: str
    warehouse_id: str
    warehouse_name: Optional[str] = None
    status: str
    order_date: datetime
    planned_delivery_date: datetime
    actual_delivery_date: Optional[datetime] = None
    notes: Optional[str] = None
    created_by: str
    created_at: datetime
    items: List[DeliveryOutItem] = []

# --- Internal Transfers Schemas ---
class TransferCreate(BaseModel):
    product_id: str
    from_warehouse_id: str
    to_warehouse_id: str
    from_location_id: Optional[str] = None
    to_location_id: Optional[str] = None
    quantity: int = Field(..., gt=0)
    notes: Optional[str] = None

class TransferOut(BaseModel):
    id: str
    transfer_number: str
    product_id: str
    product_name: Optional[str] = None
    from_warehouse_id: str
    from_warehouse_name: Optional[str] = None
    to_warehouse_id: str
    to_warehouse_name: Optional[str] = None
    quantity: int
    status: str
    initiated_date: datetime
    completed_date: Optional[datetime] = None
    created_by: str
    notes: Optional[str] = None

# --- Adjustments Schemas ---
class AdjustmentCreate(BaseModel):
    product_id: str
    warehouse_id: str
    location_id: Optional[str] = None
    physical_count: int = Field(..., ge=0)
    reason: str = Field("RECOUNT", description="DAMAGED, LOST, MISCOUNT, RECOUNT, THEFT, EXPIRATION, OTHER")
    notes: Optional[str] = None

class AdjustmentOut(BaseModel):
    id: str
    adjustment_number: str
    product_id: str
    product_name: Optional[str] = None
    warehouse_id: str
    location_id: Optional[str] = None
    quantity_before: int
    quantity_after: int
    quantity_diff: int
    reason: str
    status: str
    created_by: str
    approved_by: Optional[str] = None
    created_at: datetime

# --- Ledger Schemas ---
class LedgerOut(BaseModel):
    id: str
    date: datetime
    operation: str
    product: str
    warehouse: str
    location: Optional[str] = None
    quantity_before: int
    quantity_after: int
    quantity_change: int
    reference: str
    created_by: str
