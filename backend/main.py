import logging
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, desc, text

import models
import schemas
from database import engine, get_db, Base
from seed import seed_db

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Create database tables & seed initial workflow records
Base.metadata.create_all(bind=engine)
seed_db()

app = FastAPI(
    title="FLUXO Inventory Engine API",
    description="Production-grade, workflow-driven inventory management backend API",
    version="1.0.0",
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def utc_now():
    return datetime.now(timezone.utc)

@app.get("/")
def root():
    logger.debug("GET / called")
    return {
        "status": "success",
        "message": "FLUXO Production Engine Running",
        "version": "1.0.0",
        "timestamp": utc_now().isoformat()
    }

@app.get("/api/v1/health")
def health_check(db: Session = Depends(get_db)):
    logger.debug("GET /api/v1/health called")
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        logger.error(f"Health check DB error: {e}")
        db_status = "error"

    return {
        "status": "success",
        "database": db_status,
        "timestamp": utc_now().isoformat()
    }

# ==========================================
# 0. SUPPLIERS API (/api/v1/suppliers)
# ==========================================

@app.get("/api/v1/suppliers")
def get_suppliers(db: Session = Depends(get_db)):
    logger.debug("GET /api/v1/suppliers called")
    suppliers = db.query(models.Supplier).filter(models.Supplier.is_active == True).all()
    data = [
        {
            "id": s.id,
            "name": s.name,
            "contact_email": s.contact_email,
            "contact_phone": s.contact_phone,
            "lead_time_days": s.lead_time_days
        }
        for s in suppliers
    ]
    return {
        "status": "success",
        "data": data,
        "message": "Suppliers retrieved successfully",
        "timestamp": utc_now().isoformat()
    }

# ==========================================
# 1. PRODUCTS API (/api/v1/products)
# ==========================================

@app.get("/api/v1/products")
def get_products(
    search: Optional[str] = None,
    category: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str = Query("created_at"),
    db: Session = Depends(get_db),
):
    logger.debug(f"GET /api/v1/products called with search={search}, category={category}")
    query = db.query(models.Product)
    if search:
        fmt = f"%{search}%"
        query = query.filter(or_(models.Product.sku.ilike(fmt), models.Product.name.ilike(fmt)))
    if category and category != "ALL":
        query = query.filter(models.Product.category == category)

    if hasattr(models.Product, sort_by):
        query = query.order_by(desc(getattr(models.Product, sort_by)))
    else:
        query = query.order_by(desc(models.Product.created_at))

    total = query.count()
    skip = (page - 1) * limit
    products = query.offset(skip).limit(limit).all()

    data = []
    for p in products:
        stocks = db.query(models.Stock).filter(models.Stock.product_id == p.id).all()
        wh_summaries = []
        tot_stock = 0
        tot_reserved = 0
        for s in stocks:
            tot_stock += s.quantity
            tot_reserved += s.quantity_reserved
            wh_name = s.warehouse.name if s.warehouse else "Warehouse"
            wh_summaries.append({
                "warehouse": wh_name,
                "quantity": s.quantity,
                "low_stock": s.quantity < p.reorder_level
            })

        data.append({
            "id": p.id,
            "sku": p.sku,
            "name": p.name,
            "category": p.category,
            "unit": p.unit_of_measure,
            "reorder_level": p.reorder_level,
            "total_stock": tot_stock,
            "stock_available": max(0, tot_stock - tot_reserved),
            "warehouses": wh_summaries,
            "image_url": p.image_url,
            "created_at": p.created_at.isoformat() if p.created_at else None
        })

    return {
        "status": "success",
        "total": total,
        "page": page,
        "limit": limit,
        "data": data,
        "message": "Products retrieved successfully",
        "timestamp": utc_now().isoformat()
    }


@app.post("/api/v1/products", status_code=status.HTTP_201_CREATED)
def create_product(product_in: schemas.ProductCreate, db: Session = Depends(get_db)):
    logger.debug(f"POST /api/v1/products called: {product_in.name}")
    existing = db.query(models.Product).filter(models.Product.sku == product_in.sku).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Product SKU already exists.")

    product = models.Product(
        sku=product_in.sku,
        name=product_in.name,
        category=product_in.category,
        unit_of_measure=product_in.unit,
        reorder_level=product_in.reorder_level,
        description=product_in.description,
        image_url=product_in.image_url,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return {
        "status": "success",
        "data": {
            "id": product.id,
            "sku": product.sku,
            "name": product.name,
            "category": product.category,
            "unit": product.unit_of_measure,
            "reorder_level": product.reorder_level,
            "description": product.description,
            "image_url": product.image_url,
            "created_at": product.created_at.isoformat() if product.created_at else None
        },
        "message": "Product created successfully",
        "timestamp": utc_now().isoformat()
    }


@app.get("/api/v1/products/{product_id}")
def get_product(product_id: str, db: Session = Depends(get_db)):
    logger.debug(f"GET /api/v1/products/{product_id} called")
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

    stocks = db.query(models.Stock).filter(models.Stock.product_id == product_id).all()
    location_breakdown = []
    tot_stock = 0
    for s in stocks:
        tot_stock += s.quantity
        location_breakdown.append({
            "warehouse": s.warehouse.name if s.warehouse else "Hub",
            "location": s.location.name if s.location else "Default Location",
            "quantity": s.quantity,
            "reserved": s.quantity_reserved,
            "available": s.quantity_available
        })

    return {
        "status": "success",
        "data": {
            "id": product.id,
            "sku": product.sku,
            "name": product.name,
            "category": product.category,
            "unit": product.unit_of_measure,
            "reorder_level": product.reorder_level,
            "total_stock": tot_stock,
            "locations": location_breakdown,
            "description": product.description,
            "image_url": product.image_url,
            "created_at": product.created_at.isoformat() if product.created_at else None
        },
        "message": "Product retrieved successfully",
        "timestamp": utc_now().isoformat()
    }


@app.patch("/api/v1/products/{product_id}")
def update_product(product_id: str, update_in: schemas.ProductUpdate, db: Session = Depends(get_db)):
    logger.debug(f"PATCH /api/v1/products/{product_id} called")
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

    data = update_in.model_dump(exclude_unset=True)
    for field, val in data.items():
        setattr(product, field, val)

    db.commit()
    db.refresh(product)
    return {
        "status": "success",
        "data": {
            "id": product.id,
            "sku": product.sku,
            "name": product.name,
            "category": product.category,
            "unit": product.unit_of_measure,
            "reorder_level": product.reorder_level,
            "description": product.description,
            "image_url": product.image_url,
            "created_at": product.created_at.isoformat() if product.created_at else None
        },
        "message": "Product updated",
        "timestamp": utc_now().isoformat()
    }


@app.delete("/api/v1/products/{product_id}", status_code=status.HTTP_200_OK)
def delete_product(product_id: str, db: Session = Depends(get_db)):
    logger.debug(f"DELETE /api/v1/products/{product_id} called")
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

    active_stock = db.query(func.sum(models.Stock.quantity)).filter(models.Stock.product_id == product_id).scalar() or 0
    if active_stock > 0:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Cannot delete product with active inventory stock.")

    db.delete(product)
    db.commit()
    return {
        "status": "success",
        "data": None,
        "message": "Product deleted",
        "timestamp": utc_now().isoformat()
    }


# ==========================================
# 2. WAREHOUSES API (/api/v1/warehouses)
# ==========================================

@app.get("/api/v1/warehouses")
def get_warehouses(db: Session = Depends(get_db)):
    logger.debug("GET /api/v1/warehouses called")
    warehouses = db.query(models.Warehouse).all()
    result = []
    for wh in warehouses:
        sku_cnt = db.query(models.Stock).filter(models.Stock.warehouse_id == wh.id, models.Stock.quantity > 0).count()
        tot_qty = db.query(func.sum(models.Stock.quantity)).filter(models.Stock.warehouse_id == wh.id).scalar() or 0
        utilization = round((tot_qty / wh.capacity) * 100, 2) if wh.capacity > 0 else 0.0

        result.append({
            "id": wh.id,
            "name": wh.name,
            "code": wh.code,
            "city": wh.city,
            "address": wh.address,
            "capacity": wh.capacity,
            "sku_count": sku_cnt,
            "capacity_utilization": min(utilization, 100.0),
            "health_score": 95,
            "is_active": wh.is_active
        })
    return {
        "status": "success",
        "data": result,
        "message": "Warehouses retrieved successfully",
        "timestamp": utc_now().isoformat()
    }


@app.post("/api/v1/warehouses", status_code=status.HTTP_201_CREATED)
def create_warehouse(wh_in: schemas.WarehouseCreate, db: Session = Depends(get_db)):
    logger.debug(f"POST /api/v1/warehouses called: {wh_in.name}")
    if len(wh_in.code) < 3 or len(wh_in.code) > 10:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Warehouse code must be 3-10 characters.")
    existing = db.query(models.Warehouse).filter(models.Warehouse.code == wh_in.code).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Warehouse code already exists.")

    wh = models.Warehouse(**wh_in.model_dump())
    db.add(wh)
    db.commit()
    db.refresh(wh)
    return {
        "status": "success",
        "data": wh,
        "message": "Warehouse created",
        "timestamp": utc_now().isoformat()
    }


@app.get("/api/v1/warehouses/{warehouse_id}")
def get_warehouse(warehouse_id: str, db: Session = Depends(get_db)):
    logger.debug(f"GET /api/v1/warehouses/{warehouse_id} called")
    wh = db.query(models.Warehouse).filter(models.Warehouse.id == warehouse_id).first()
    if not wh:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Warehouse not found.")

    locs = db.query(models.Location).filter(models.Location.warehouse_id == warehouse_id).all()
    return {
        "status": "success",
        "data": {
            "id": wh.id,
            "name": wh.name,
            "code": wh.code,
            "city": wh.city,
            "address": wh.address,
            "capacity": wh.capacity,
            "locations": [{"id": l.id, "name": l.name, "code": l.code, "type": l.location_type} for l in locs],
            "is_active": wh.is_active
        },
        "message": "Warehouse retrieved successfully",
        "timestamp": utc_now().isoformat()
    }


@app.patch("/api/v1/warehouses/{warehouse_id}")
def update_warehouse(warehouse_id: str, update_in: schemas.WarehouseUpdate, db: Session = Depends(get_db)):
    logger.debug(f"PATCH /api/v1/warehouses/{warehouse_id} called")
    wh = db.query(models.Warehouse).filter(models.Warehouse.id == warehouse_id).first()
    if not wh:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Warehouse not found.")

    for field, val in update_in.model_dump(exclude_unset=True).items():
        setattr(wh, field, val)

    db.commit()
    db.refresh(wh)
    return {
        "status": "success",
        "data": wh,
        "message": "Warehouse updated",
        "timestamp": utc_now().isoformat()
    }


# ==========================================
# 3. LOCATIONS API
# ==========================================

@app.get("/api/v1/warehouses/{warehouse_id}/locations")
def get_locations(warehouse_id: str, db: Session = Depends(get_db)):
    logger.debug(f"GET /api/v1/warehouses/{warehouse_id}/locations called")
    locs = db.query(models.Location).filter(models.Location.warehouse_id == warehouse_id).all()
    result = []
    for l in locs:
        qty = db.query(func.sum(models.Stock.quantity)).filter(models.Stock.location_id == l.id).scalar() or 0
        result.append({
            "id": l.id,
            "warehouse_id": l.warehouse_id,
            "name": l.name,
            "code": l.code,
            "location_type": l.location_type,
            "capacity": l.capacity,
            "is_active": l.is_active,
            "current_stock_quantity": qty
        })
    return {
        "status": "success",
        "data": result,
        "message": "Locations retrieved successfully",
        "timestamp": utc_now().isoformat()
    }


# ==========================================
# 4. STOCK API
# ==========================================

@app.get("/api/v1/stock")
def get_stock(
    product_id: Optional[str] = None,
    warehouse_id: Optional[str] = None,
    location_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    logger.debug(f"GET /api/v1/stock called")
    query = db.query(models.Stock)
    if product_id:
        query = query.filter(models.Stock.product_id == product_id)
    if warehouse_id:
        query = query.filter(models.Stock.warehouse_id == warehouse_id)
    if location_id:
        query = query.filter(models.Stock.location_id == location_id)

    stocks = query.all()
    if not stocks and product_id:
        prod = db.query(models.Product).filter(models.Product.id == product_id).first()
        wh = db.query(models.Warehouse).filter(models.Warehouse.id == warehouse_id).first() if warehouse_id else None
        return {
            "status": "success",
            "data": {
                "product": {"id": prod.id, "name": prod.name} if prod else None,
                "warehouse": {"id": wh.id, "name": wh.name} if wh else None,
                "quantity": 0,
                "quantity_reserved": 0,
                "quantity_available": 0,
                "low_stock": True,
                "locations": [],
                "reorder_level": prod.reorder_level if prod else 10
            },
            "timestamp": utc_now().isoformat()
        }

    tot_qty = sum(s.quantity for s in stocks)
    tot_res = sum(s.quantity_reserved for s in stocks)
    prod = stocks[0].product if stocks else None
    wh = stocks[0].warehouse if stocks else None

    loc_breakdown = [{"name": s.location.name if s.location else "Default Location", "quantity": s.quantity} for s in stocks]

    return {
        "status": "success",
        "data": {
            "product": {"id": prod.id, "sku": prod.sku, "name": prod.name} if prod else None,
            "warehouse": {"id": wh.id, "name": wh.name} if wh else None,
            "quantity": tot_qty,
            "quantity_reserved": tot_res,
            "quantity_available": max(0, tot_qty - tot_res),
            "low_stock": tot_qty < (prod.reorder_level if prod else 10),
            "locations": loc_breakdown,
            "reorder_level": prod.reorder_level if prod else 10,
            "last_counted_at": stocks[0].last_counted_at.isoformat() if stocks and stocks[0].last_counted_at else None
        },
        "timestamp": utc_now().isoformat()
    }


# ==========================================
# 5. RECEIPTS API
# ==========================================

@app.post("/api/v1/receipts", status_code=status.HTTP_201_CREATED)
def create_receipt(receipt_in: schemas.ReceiptCreate, db: Session = Depends(get_db)):
    logger.debug(f"POST /api/v1/receipts called")
    rcp_cnt = db.query(models.Receipt).count() + 1
    rcp_num = f"RCP-2026-{rcp_cnt:03d}"

    tot_expected = sum(item.quantity_expected for item in receipt_in.items)

    rcp = models.Receipt(
        supplier_id=receipt_in.supplier_id,
        warehouse_id=receipt_in.warehouse_id,
        receipt_number=rcp_num,
        status="DRAFT",
        expected_date=utc_now() + timedelta(days=5),
        total_items=tot_expected,
        notes=receipt_in.notes,
        created_by="OpsAdmin"
    )
    db.add(rcp)
    db.commit()
    db.refresh(rcp)

    for item in receipt_in.items:
        rcp_item = models.ReceiptItem(
            receipt_id=rcp.id,
            product_id=item.product_id,
            quantity_expected=item.quantity_expected,
            unit_price=item.unit_price
        )
        db.add(rcp_item)

    db.commit()
    db.refresh(rcp)
    return {
        "status": "success",
        "data": {
            "id": rcp.id,
            "receipt_number": rcp.receipt_number,
            "supplier_id": rcp.supplier_id,
            "warehouse_id": rcp.warehouse_id,
            "status": rcp.status,
            "expected_date": rcp.expected_date.isoformat() if rcp.expected_date else None,
            "total_items": rcp.total_items
        },
        "message": "Receipt draft created",
        "timestamp": utc_now().isoformat()
    }


@app.get("/api/v1/receipts")
def get_receipts(
    warehouse_id: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db)
):
    logger.debug("GET /api/v1/receipts called")
    query = db.query(models.Receipt)
    if warehouse_id:
        query = query.filter(models.Receipt.warehouse_id == warehouse_id)
    if status_filter and status_filter != "ALL":
        query = query.filter(models.Receipt.status == status_filter)

    receipts = query.order_by(desc(models.Receipt.created_at)).all()
    result = []
    for r in receipts:
        received_cnt = sum((i.quantity_received or 0) for i in r.items)
        result.append({
            "id": r.id,
            "receipt_number": r.receipt_number,
            "supplier_id": r.supplier_id,
            "supplier_name": r.supplier.name if r.supplier else "Supplier",
            "warehouse_id": r.warehouse_id,
            "warehouse_name": r.warehouse.name if r.warehouse else "Warehouse",
            "status": r.status,
            "expected_date": r.expected_date.isoformat() if r.expected_date else None,
            "total_items_expected": r.total_items,
            "received_count": received_cnt
        })
    return {
        "status": "success",
        "data": result,
        "message": "Receipts retrieved successfully",
        "timestamp": utc_now().isoformat()
    }


@app.get("/api/v1/receipts/{receipt_id}")
def get_receipt_detail(receipt_id: str, db: Session = Depends(get_db)):
    logger.debug(f"GET /api/v1/receipts/{receipt_id} called")
    rcp = db.query(models.Receipt).filter(models.Receipt.id == receipt_id).first()
    if not rcp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Receipt not found.")

    items_out = []
    for item in rcp.items:
        items_out.append({
            "id": item.id,
            "product_id": item.product_id,
            "product_name": item.product.name if item.product else "Item",
            "quantity_expected": item.quantity_expected,
            "quantity_received": item.quantity_received,
            "unit_price": item.unit_price,
            "is_accepted": item.is_accepted
        })

    return {
        "status": "success",
        "data": {
            "id": rcp.id,
            "receipt_number": rcp.receipt_number,
            "supplier_name": rcp.supplier.name if rcp.supplier else "Supplier",
            "warehouse_name": rcp.warehouse.name if rcp.warehouse else "Warehouse",
            "status": rcp.status,
            "expected_date": rcp.expected_date.isoformat() if rcp.expected_date else None,
            "received_date": rcp.received_date.isoformat() if rcp.received_date else None,
            "items": items_out
        },
        "message": "Receipt retrieved successfully",
        "timestamp": utc_now().isoformat()
    }


@app.post("/api/v1/receipts/{receipt_id}/receive")
def receive_receipt_items(receipt_id: str, items: List[schemas.ReceiptReceiveInput], db: Session = Depends(get_db)):
    logger.debug(f"POST /api/v1/receipts/{receipt_id}/receive called")
    rcp = db.query(models.Receipt).filter(models.Receipt.id == receipt_id).first()
    if not rcp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Receipt not found.")

    for input_item in items:
        rcp_item = db.query(models.ReceiptItem).filter(models.ReceiptItem.id == input_item.receipt_item_id).first()
        if rcp_item:
            rcp_item.quantity_received = input_item.quantity_received
            rcp_item.received_at = utc_now()

    rcp.status = "RECEIVED"
    db.commit()
    return {
        "status": "success",
        "data": {"id": rcp.id, "status": rcp.status},
        "message": "Items recorded as received",
        "timestamp": utc_now().isoformat()
    }


@app.post("/api/v1/receipts/{receipt_id}/validate")
def validate_receipt(receipt_id: str, db: Session = Depends(get_db)):
    logger.debug(f"POST /api/v1/receipts/{receipt_id}/validate called")
    rcp = db.query(models.Receipt).filter(models.Receipt.id == receipt_id).first()
    if not rcp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Receipt not found.")

    rcp.status = "VALIDATED"
    db.commit()
    return {
        "status": "success",
        "data": {"id": rcp.id, "status": rcp.status},
        "message": "Receipt validated",
        "timestamp": utc_now().isoformat()
    }


@app.post("/api/v1/receipts/{receipt_id}/complete")
def complete_receipt(receipt_id: str, db: Session = Depends(get_db)):
    logger.debug(f"POST /api/v1/receipts/{receipt_id}/complete called")
    rcp = db.query(models.Receipt).filter(models.Receipt.id == receipt_id).first()
    if not rcp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Receipt not found.")
    if rcp.status == "COMPLETED":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Receipt already completed.")

    for item in rcp.items:
        qty_rec = item.quantity_received or item.quantity_expected
        stock = db.query(models.Stock).filter(
            models.Stock.product_id == item.product_id,
            models.Stock.warehouse_id == rcp.warehouse_id
        ).first()

        qty_before = stock.quantity if stock else 0
        if stock:
            stock.quantity += qty_rec
        else:
            stock = models.Stock(
                product_id=item.product_id,
                warehouse_id=rcp.warehouse_id,
                quantity=qty_rec
            )
            db.add(stock)

        item.is_accepted = True

        ledger = models.StockLedger(
            product_id=item.product_id,
            warehouse_id=rcp.warehouse_id,
            operation_type="RECEIPT",
            quantity_before=qty_before,
            quantity_after=qty_before + qty_rec,
            reference_type="RECEIPT",
            reference_id=rcp.id,
            reference_number=rcp.receipt_number,
            notes="Receipt completed from supplier",
            created_by="OpsAdmin"
        )
        db.add(ledger)

    rcp.status = "COMPLETED"
    rcp.received_date = utc_now()
    db.commit()
    db.refresh(rcp)
    return {
        "status": "success",
        "data": {
            "id": rcp.id,
            "receipt_number": rcp.receipt_number,
            "status": rcp.status
        },
        "message": "Receipt completed and stock updated",
        "timestamp": utc_now().isoformat()
    }


# ==========================================
# 6. DELIVERIES API
# ==========================================

@app.post("/api/v1/deliveries", status_code=status.HTTP_201_CREATED)
def create_delivery(delivery_in: schemas.DeliveryCreate, db: Session = Depends(get_db)):
    logger.debug(f"POST /api/v1/deliveries called")
    dlv_cnt = db.query(models.Delivery).count() + 1
    dlv_num = f"DEL-2026-{dlv_cnt:03d}"

    for item in delivery_in.items:
        stock = db.query(models.Stock).filter(
            models.Stock.product_id == item.product_id,
            models.Stock.warehouse_id == delivery_in.warehouse_id
        ).first()

        avail = stock.quantity_available if stock else 0
        if avail < item.quantity_ordered:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient available stock for product {item.product_id}. Available: {avail}, Ordered: {item.quantity_ordered}"
            )

        stock.quantity_reserved += item.quantity_ordered

    dlv = models.Delivery(
        delivery_number=dlv_num,
        customer_id=delivery_in.customer_id,
        warehouse_id=delivery_in.warehouse_id,
        status="DRAFT",
        order_date=utc_now(),
        planned_delivery_date=utc_now() + timedelta(days=3),
        notes=delivery_in.notes,
        created_by="OpsAdmin"
    )
    db.add(dlv)
    db.commit()
    db.refresh(dlv)

    for item in delivery_in.items:
        dlv_item = models.DeliveryItem(
            delivery_id=dlv.id,
            product_id=item.product_id,
            quantity_ordered=item.quantity_ordered,
            unit_price=item.unit_price,
            status="PENDING"
        )
        db.add(dlv_item)

    db.commit()
    db.refresh(dlv)
    return {
        "status": "success",
        "data": {
            "id": dlv.id,
            "delivery_number": dlv.delivery_number,
            "status": dlv.status
        },
        "message": "Delivery created and stock reserved",
        "timestamp": utc_now().isoformat()
    }


@app.get("/api/v1/deliveries")
def get_deliveries(
    warehouse_id: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db)
):
    logger.debug("GET /api/v1/deliveries called")
    query = db.query(models.Delivery)
    if warehouse_id:
        query = query.filter(models.Delivery.warehouse_id == warehouse_id)
    if status_filter and status_filter != "ALL":
        query = query.filter(models.Delivery.status == status_filter)

    deliveries = query.order_by(desc(models.Delivery.created_at)).all()
    result = []
    for d in deliveries:
        result.append({
            "id": d.id,
            "delivery_number": d.delivery_number,
            "customer_id": d.customer_id,
            "warehouse_id": d.warehouse_id,
            "warehouse_name": d.warehouse.name if d.warehouse else "Warehouse",
            "status": d.status,
            "order_date": d.order_date.isoformat() if d.order_date else None,
            "planned_delivery_date": d.planned_delivery_date.isoformat() if d.planned_delivery_date else None
        })
    return {
        "status": "success",
        "data": result,
        "message": "Deliveries retrieved successfully",
        "timestamp": utc_now().isoformat()
    }


@app.post("/api/v1/deliveries/{delivery_id}/ship")
def ship_delivery(delivery_id: str, db: Session = Depends(get_db)):
    logger.debug(f"POST /api/v1/deliveries/{delivery_id}/ship called")
    dlv = db.query(models.Delivery).filter(models.Delivery.id == delivery_id).first()
    if not dlv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Delivery not found.")
    if dlv.status in ["SHIPPED", "DELIVERED"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Delivery already shipped.")

    for item in dlv.items:
        qty_ship = item.quantity_shipped or item.quantity_ordered
        stock = db.query(models.Stock).filter(
            models.Stock.product_id == item.product_id,
            models.Stock.warehouse_id == dlv.warehouse_id
        ).first()

        if stock:
            qty_before = stock.quantity
            stock.quantity -= qty_ship
            stock.quantity_reserved = max(0, stock.quantity_reserved - item.quantity_ordered)

            ledger = models.StockLedger(
                product_id=item.product_id,
                warehouse_id=dlv.warehouse_id,
                operation_type="DELIVERY",
                quantity_before=qty_before,
                quantity_after=stock.quantity,
                reference_type="DELIVERY",
                reference_id=dlv.id,
                reference_number=dlv.delivery_number,
                notes=f"Shipped to customer {dlv.customer_id}",
                created_by="OpsAdmin"
            )
            db.add(ledger)

        item.status = "SHIPPED"
        item.quantity_shipped = qty_ship

    dlv.status = "SHIPPED"
    dlv.actual_delivery_date = utc_now()
    db.commit()
    return {
        "status": "success",
        "data": {"id": dlv.id, "status": dlv.status},
        "message": "Delivery shipped successfully",
        "timestamp": utc_now().isoformat()
    }


# ==========================================
# 7. INTERNAL TRANSFERS API
# ==========================================

@app.post("/api/v1/transfers", status_code=status.HTTP_201_CREATED)
def create_transfer(transfer_in: schemas.TransferCreate, db: Session = Depends(get_db)):
    logger.debug(f"POST /api/v1/transfers called")
    stock = db.query(models.Stock).filter(
        models.Stock.product_id == transfer_in.product_id,
        models.Stock.warehouse_id == transfer_in.from_warehouse_id
    ).first()

    avail = stock.quantity_available if stock else 0
    if avail < transfer_in.quantity:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient stock at source warehouse.")

    trn_cnt = db.query(models.InternalTransfer).count() + 1
    trn_num = f"TRN-2026-{trn_cnt:03d}"

    trn = models.InternalTransfer(
        transfer_number=trn_num,
        product_id=transfer_in.product_id,
        from_warehouse_id=transfer_in.from_warehouse_id,
        to_warehouse_id=transfer_in.to_warehouse_id,
        from_location_id=transfer_in.from_location_id,
        to_location_id=transfer_in.to_location_id,
        quantity=transfer_in.quantity,
        status="PENDING",
        created_by="OpsAdmin",
        notes=transfer_in.notes
    )
    db.add(trn)
    db.commit()
    db.refresh(trn)
    return {
        "status": "success",
        "data": {
            "id": trn.id,
            "transfer_number": trn.transfer_number,
            "status": trn.status
        },
        "message": "Transfer initiated",
        "timestamp": utc_now().isoformat()
    }


# ==========================================
# 8. ADJUSTMENTS API
# ==========================================

@app.post("/api/v1/adjustments", status_code=status.HTTP_201_CREATED)
def create_adjustment(adj_in: schemas.AdjustmentCreate, db: Session = Depends(get_db)):
    logger.debug(f"POST /api/v1/adjustments called")
    stock = db.query(models.Stock).filter(
        models.Stock.product_id == adj_in.product_id,
        models.Stock.warehouse_id == adj_in.warehouse_id
    ).first()

    qty_before = stock.quantity if stock else 0
    adj_cnt = db.query(models.StockAdjustment).count() + 1
    adj_num = f"ADJ-2026-{adj_cnt:03d}"

    adj = models.StockAdjustment(
        adjustment_number=adj_num,
        product_id=adj_in.product_id,
        warehouse_id=adj_in.warehouse_id,
        location_id=adj_in.location_id,
        quantity_before=qty_before,
        quantity_after=adj_in.physical_count,
        reason=adj_in.reason,
        status="DRAFT",
        created_by="OpsAdmin",
        notes=adj_in.notes
    )
    db.add(adj)
    db.commit()
    db.refresh(adj)
    return {
        "status": "success",
        "data": {
            "id": adj.id,
            "adjustment_number": adj.adjustment_number,
            "status": adj.status
        },
        "message": "Adjustment draft created",
        "timestamp": utc_now().isoformat()
    }


# ==========================================
# 9. STOCK LEDGER API
# ==========================================

@app.get("/api/v1/ledger")
def get_ledger(
    product_id: Optional[str] = None,
    warehouse_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    logger.debug("GET /api/v1/ledger called")
    query = db.query(models.StockLedger)
    if product_id:
        query = query.filter(models.StockLedger.product_id == product_id)
    if warehouse_id:
        query = query.filter(models.StockLedger.warehouse_id == warehouse_id)

    entries = query.order_by(desc(models.StockLedger.created_at)).all()
    result = []
    for e in entries:
        result.append({
            "id": e.id,
            "date": e.created_at.isoformat() if e.created_at else None,
            "operation": e.operation_type,
            "product": e.product.name if e.product else "Product",
            "warehouse": e.warehouse.name if e.warehouse else "Warehouse",
            "quantity_before": e.quantity_before,
            "quantity_after": e.quantity_after,
            "quantity_change": e.quantity_change,
            "reference": e.reference_number,
            "created_by": e.created_by
        })
    return {
        "status": "success",
        "total": len(result),
        "data": result,
        "message": "Ledger entries retrieved successfully",
        "timestamp": utc_now().isoformat()
    }


# ==========================================
# 10. DASHBOARD TELEMETRY APIS
# ==========================================

@app.get("/api/v1/dashboard/kpis")
def get_dashboard_kpis(db: Session = Depends(get_db)):
    logger.debug("GET /api/v1/dashboard/kpis called")
    tot_products = db.query(models.Product).count()
    tot_stock_qty = db.query(func.sum(models.Stock.quantity)).scalar() or 0
    tot_value = tot_stock_qty * 185.0

    healthy = int(tot_products * 0.85)
    low_stock = int(tot_products * 0.10)
    out_of_stock = max(0, tot_products - healthy - low_stock)

    return {
        "status": "success",
        "data": {
            "total_products": tot_products,
            "total_stock_value": f"${(tot_value/1000000):.2f}M",
            "in_stock": healthy,
            "low_stock": low_stock,
            "out_of_stock": out_of_stock,
            "pending_receipts": db.query(models.Receipt).filter(models.Receipt.status != "COMPLETED").count(),
            "pending_deliveries": db.query(models.Delivery).filter(models.Delivery.status != "SHIPPED").count(),
            "pending_transfers": db.query(models.InternalTransfer).filter(models.InternalTransfer.status != "COMPLETED").count(),
            "accuracy_score": 98.5
        },
        "message": "KPIs retrieved successfully",
        "timestamp": utc_now().isoformat()
    }

@app.get("/api/v1/dashboard/operations-summary")
def get_operations_summary(db: Session = Depends(get_db)):
    logger.debug("GET /api/v1/dashboard/operations-summary called")
    return {
        "status": "success",
        "data": {
            "receipts": {"count": 23, "trend": "+12%"},
            "deliveries": {"count": 14, "trend": "-8%"},
            "transfers": {"count": 8, "trend": "+5%"},
            "adjustments": {"count": 2, "trend": "+0%"}
        },
        "message": "Operations summary retrieved successfully",
        "timestamp": utc_now().isoformat()
    }

@app.get("/api/v1/dashboard/warehouse-distribution")
def get_warehouse_distribution(db: Session = Depends(get_db)):
    logger.debug("GET /api/v1/dashboard/warehouse-distribution called")
    warehouses = db.query(models.Warehouse).all()
    res = []
    for wh in warehouses:
        tot_qty = db.query(func.sum(models.Stock.quantity)).filter(models.Stock.warehouse_id == wh.id).scalar() or 0
        skus = db.query(models.Stock).filter(models.Stock.warehouse_id == wh.id).count()
        util = round((tot_qty / wh.capacity) * 100, 2) if wh.capacity > 0 else 0.0
        res.append({
            "name": wh.name,
            "skus": skus,
            "capacity": wh.capacity,
            "utilization": min(util, 100.0),
            "health": 95,
            "low_stock_items": 12
        })
    return {
        "status": "success",
        "data": res,
        "message": "Warehouse distribution retrieved successfully",
        "timestamp": utc_now().isoformat()
    }

@app.get("/api/v1/dashboard/live-activity")
def get_live_activity(limit: int = 20, db: Session = Depends(get_db)):
    logger.debug("GET /api/v1/dashboard/live-activity called")
    entries = db.query(models.StockLedger).order_by(desc(models.StockLedger.created_at)).limit(limit).all()
    res = []
    for e in entries:
        res.append({
            "timestamp": e.created_at.isoformat() if e.created_at else None,
            "type": e.operation_type,
            "product": e.product.name if e.product else "Item",
            "quantity": e.quantity_change,
            "warehouse": e.warehouse.name if e.warehouse else "Hub",
            "user": e.created_by,
            "reference": e.reference_number,
            "status": "COMPLETED"
        })
    return {
        "status": "success",
        "data": res,
        "message": "Live activity retrieved successfully",
        "timestamp": utc_now().isoformat()
    }

@app.get("/api/v1/dashboard/low-stock")
def get_low_stock_items(db: Session = Depends(get_db)):
    logger.debug("GET /api/v1/dashboard/low-stock called")
    products = db.query(models.Product).all()
    res = []
    for p in products:
        stocks = db.query(models.Stock).filter(models.Stock.product_id == p.id).all()
        tot_qty = sum(s.quantity for s in stocks)
        if tot_qty < p.reorder_level:
            res.append({
                "product": p.name,
                "warehouse": stocks[0].warehouse.name if stocks and stocks[0].warehouse else "Primary Hub",
                "current": tot_qty,
                "reorder_level": p.reorder_level,
                "suggested_order": p.reorder_level * 5
            })
    return {
        "status": "success",
        "data": res,
        "message": "Low stock items retrieved successfully",
        "timestamp": utc_now().isoformat()
    }

@app.get("/api/v1/dashboard/health-score")
def get_health_score(db: Session = Depends(get_db)):
    logger.debug("GET /api/v1/dashboard/health-score called")
    return {
        "status": "success",
        "data": {"health_score": 95.5, "status": "Optimal"},
        "message": "Health score retrieved successfully",
        "timestamp": utc_now().isoformat()
    }
