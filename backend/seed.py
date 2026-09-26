import os
import random
from datetime import datetime, timezone, timedelta
from database import engine, SessionLocal, Base, create_tables
import models

def utc_now():
    return datetime.now(timezone.utc)

def seed_db():
    create_tables()
    db = SessionLocal()

    # Skip if database already contains records
    if db.query(models.Warehouse).first():
        print("[SEED] Database already populated with production seed data. Skipping.")
        db.close()
        return

    print("[SEED] Starting comprehensive production inventory data seeding...")
    now = utc_now()

    # ==========================================
    # 1. WAREHOUSES
    # ==========================================
    wh_austin = models.Warehouse(
        name="Austin Hub", code="AUS", address="100 Logistics Way", city="Austin", capacity=10000, is_active=True
    )
    wh_dallas = models.Warehouse(
        name="Dallas Logistics", code="DAL", address="250 Freight Expressway", city="Dallas", capacity=8000, is_active=True
    )
    wh_reno = models.Warehouse(
        name="Reno West", code="REN", address="500 Supply Chain Blvd", city="Reno", capacity=5000, is_active=True
    )
    db.add_all([wh_austin, wh_dallas, wh_reno])
    db.commit()

    # ==========================================
    # 2. LOCATIONS
    # ==========================================
    loc_aus_a1 = models.Location(warehouse_id=wh_austin.id, name="Rack A-1", code="AUS-A1", location_type="RACK", capacity=1000)
    loc_aus_a2 = models.Location(warehouse_id=wh_austin.id, name="Rack A-2", code="AUS-A2", location_type="RACK", capacity=1000)
    loc_aus_a3 = models.Location(warehouse_id=wh_austin.id, name="Rack A-3", code="AUS-A3", location_type="RACK", capacity=1000)
    loc_aus_b1 = models.Location(warehouse_id=wh_austin.id, name="Shelf B-1", code="AUS-B1", location_type="SHELF", capacity=500)
    loc_aus_b2 = models.Location(warehouse_id=wh_austin.id, name="Shelf B-2", code="AUS-B2", location_type="SHELF", capacity=500)
    loc_aus_c1 = models.Location(warehouse_id=wh_austin.id, name="Floor C-1", code="AUS-C1", location_type="FLOOR", capacity=2000)

    loc_dal_d1 = models.Location(warehouse_id=wh_dallas.id, name="Rack D-1", code="DAL-D1", location_type="RACK", capacity=1200)
    loc_dal_d2 = models.Location(warehouse_id=wh_dallas.id, name="Rack D-2", code="DAL-D2", location_type="RACK", capacity=1200)
    loc_dal_e1 = models.Location(warehouse_id=wh_dallas.id, name="Bin E-1", code="DAL-E1", location_type="BIN", capacity=300)
    loc_dal_e2 = models.Location(warehouse_id=wh_dallas.id, name="Bin E-2", code="DAL-E2", location_type="BIN", capacity=300)
    loc_dal_e3 = models.Location(warehouse_id=wh_dallas.id, name="Bin E-3", code="DAL-E3", location_type="BIN", capacity=300)

    loc_ren_f1 = models.Location(warehouse_id=wh_reno.id, name="Rack F-1", code="REN-F1", location_type="RACK", capacity=1500)
    loc_ren_g1 = models.Location(warehouse_id=wh_reno.id, name="Freezer G-1", code="REN-G1", location_type="FREEZER", capacity=500)

    all_locations = [
        loc_aus_a1, loc_aus_a2, loc_aus_a3, loc_aus_b1, loc_aus_b2, loc_aus_c1,
        loc_dal_d1, loc_dal_d2, loc_dal_e1, loc_dal_e2, loc_dal_e3,
        loc_ren_f1, loc_ren_g1
    ]
    db.add_all(all_locations)
    db.commit()

    # ==========================================
    # 3. 20 PRODUCTS
    # ==========================================
    products_data = [
        # MATERIALS
        ("STEEL-001", "Steel Rods", "MATERIALS", "kg", 100, "High tensile structural steel rods"),
        ("ALU-001", "Aluminum Sheets", "MATERIALS", "units", 50, "Anodized industrial aluminum plates"),
        ("COPPER-001", "Copper Wire", "MATERIALS", "kg", 75, "99.9% pure electrical copper wiring"),
        ("CARB-001", "Carbon Fiber Sheets", "MATERIALS", "units", 30, "Aerospace grade woven carbon fiber"),
        ("TITAN-001", "Titanium Fasteners", "MATERIALS", "boxes", 150, "Corrosion resistant grade 5 titanium screws"),

        # ELECTRONICS
        ("CIRCUIT-001", "Circuit Boards", "ELECTRONICS", "units", 200, "Multi-layer PCB mainboards"),
        ("RES-001", "Resistors 10k", "ELECTRONICS", "units", 1000, "Precision SMD resistors"),
        ("CAP-001", "Capacitors 100uF", "ELECTRONICS", "units", 800, "Electrolytic low-ESR capacitors"),
        ("OLED-001", "OLED Display 6.7\"", "ELECTRONICS", "units", 100, "AMOLED high contrast panels"),
        ("MCU-001", "Microcontrollers ARM", "ELECTRONICS", "units", 300, "32-bit Cortex M4 processors"),

        # FURNITURE
        ("TABLE-001", "Wooden Tables", "FURNITURE", "units", 10, "Solid oak executive conference tables"),
        ("CHAIR-001", "Office Chairs", "FURNITURE", "units", 25, "Ergonomic mesh office task chairs"),
        ("SHELF-001", "Shelving Units", "FURNITURE", "units", 5, "Heavy duty steel warehouse storage racks"),
        ("DESK-001", "Executive Desks", "FURNITURE", "units", 8, "Motorized height adjustable standing desks"),
        ("CAB-001", "Filing Cabinets", "FURNITURE", "units", 12, "Lockable 4-drawer metal document cabinets"),

        # TOOLS & OTHER
        ("DRILL-001", "Power Drills", "TOOLS", "units", 8, "20V Lithium brushless cordless drills"),
        ("TOOLSET-001", "Tool Sets 150pc", "TOOLS", "units", 12, "Professional mechanic socket & wrench kit"),
        ("MOTOR-001", "Stepper Motors NEMA 17", "TOOLS", "units", 15, "High torque precision positioning motors"),
        ("SCAN-001", "Laser Barcode Scanners", "TOOLS", "units", 20, "Wireless industrial 2D barcode handheld readers"),
        ("MULTI-001", "Digital Multimeters", "TOOLS", "units", 10, "TRMS professional auto-ranging multimeters"),
    ]

    products_map = {}
    for sku, name, cat, unit, reorder, desc in products_data:
        p = models.Product(
            sku=sku, name=name, category=cat, unit_of_measure=unit, reorder_level=reorder, description=desc
        )
        db.add(p)
        db.commit()
        products_map[sku] = p

    # ==========================================
    # 4. SUPPLIERS
    # ==========================================
    suppliers_data = [
        ("ACME Manufacturing", "contact@acme.com", "+1-800-555-0100", 7),
        ("Global Electronics", "sales@globalelectronics.com", "+1-800-555-0200", 14),
        ("Furniture Plus", "orders@furnitureplus.com", "+1-800-555-0300", 10),
        ("Industrial Materials", "supply@indmaterials.com", "+1-800-555-0400", 5),
        ("Tech Components", "info@techcomponents.io", "+1-800-555-0500", 21),
    ]

    suppliers_list = []
    for s_name, email, phone, lead in suppliers_data:
        sup = models.Supplier(
            name=s_name, contact_email=email, contact_phone=phone, lead_time_days=lead, is_active=True
        )
        db.add(sup)
        db.commit()
        suppliers_list.append(sup)

    # ==========================================
    # 5. STOCK ALLOCATION (Austin, Dallas, Reno)
    # ==========================================
    stocks_to_create = [
        # Austin
        (products_map["STEEL-001"].id, wh_austin.id, loc_aus_a1.id, 300, 20),
        (products_map["STEEL-001"].id, wh_austin.id, loc_aus_a2.id, 300, 0),
        (products_map["STEEL-001"].id, wh_austin.id, loc_aus_b1.id, 150, 0),
        (products_map["ALU-001"].id, wh_austin.id, loc_aus_a3.id, 420, 30),
        (products_map["CIRCUIT-001"].id, wh_austin.id, loc_aus_a1.id, 2000, 100),
        (products_map["CIRCUIT-001"].id, wh_austin.id, loc_aus_a2.id, 1500, 0),
        (products_map["CHAIR-001"].id, wh_austin.id, loc_aus_c1.id, 180, 15),
        (products_map["COPPER-001"].id, wh_austin.id, loc_aus_b2.id, 500, 0),
        (products_map["RES-001"].id, wh_austin.id, loc_aus_b1.id, 5000, 0),
        (products_map["DRILL-001"].id, wh_austin.id, loc_aus_c1.id, 45, 5),

        # Dallas
        (products_map["STEEL-001"].id, wh_dallas.id, loc_dal_d1.id, 350, 0),
        (products_map["ALU-001"].id, wh_dallas.id, loc_dal_e1.id, 280, 20),
        (products_map["CIRCUIT-001"].id, wh_dallas.id, loc_dal_d2.id, 1200, 50),
        (products_map["CHAIR-001"].id, wh_dallas.id, loc_dal_d1.id, 100, 0),
        (products_map["CAP-001"].id, wh_dallas.id, loc_dal_e2.id, 3000, 0),
        (products_map["TABLE-001"].id, wh_dallas.id, loc_dal_d2.id, 25, 2),

        # Reno
        (products_map["STEEL-001"].id, wh_reno.id, loc_ren_f1.id, 150, 0),
        (products_map["ALU-001"].id, wh_reno.id, loc_ren_g1.id, 90, 0),
        (products_map["CIRCUIT-001"].id, wh_reno.id, loc_ren_f1.id, 800, 0),
        (products_map["OLED-001"].id, wh_reno.id, loc_ren_f1.id, 250, 10),
        (products_map["MCU-001"].id, wh_reno.id, loc_ren_f1.id, 600, 0),
    ]

    for p_id, w_id, l_id, qty, res in stocks_to_create:
        s = models.Stock(
            product_id=p_id, warehouse_id=w_id, location_id=l_id, quantity=qty, quantity_reserved=res
        )
        db.add(s)

    db.commit()

    # ==========================================
    # 6. RECEIPTS (5 Records)
    # ==========================================
    rcp_1 = models.Receipt(
        supplier_id=suppliers_list[3].id, warehouse_id=wh_austin.id, receipt_number="RCP-2024-001",
        status="COMPLETED", expected_date=now - timedelta(days=5), received_date=now - timedelta(days=5),
        total_items=250, created_by="soha@fluxo.com"
    )
    rcp_2 = models.Receipt(
        supplier_id=suppliers_list[2].id, warehouse_id=wh_dallas.id, receipt_number="RCP-2024-002",
        status="COMPLETED", expected_date=now - timedelta(days=2), received_date=now - timedelta(days=2),
        total_items=100, created_by="alex@fluxo.com"
    )
    rcp_3 = models.Receipt(
        supplier_id=suppliers_list[1].id, warehouse_id=wh_austin.id, receipt_number="RCP-2024-003",
        status="VALIDATED", expected_date=now + timedelta(days=1), total_items=500, created_by="soha@fluxo.com"
    )
    rcp_4 = models.Receipt(
        supplier_id=suppliers_list[0].id, warehouse_id=wh_reno.id, receipt_number="RCP-2024-004",
        status="DRAFT", expected_date=now + timedelta(days=3), total_items=150, created_by="manager@fluxo.com"
    )
    rcp_5 = models.Receipt(
        supplier_id=suppliers_list[4].id, warehouse_id=wh_austin.id, receipt_number="RCP-2024-005",
        status="DRAFT", expected_date=now + timedelta(days=7), total_items=1000, created_by="soha@fluxo.com"
    )
    db.add_all([rcp_1, rcp_2, rcp_3, rcp_4, rcp_5])
    db.commit()

    # Receipt Items
    rcp_items = [
        models.ReceiptItem(receipt_id=rcp_1.id, product_id=products_map["STEEL-001"].id, quantity_expected=250, quantity_received=250, is_accepted=True),
        models.ReceiptItem(receipt_id=rcp_2.id, product_id=products_map["CHAIR-001"].id, quantity_expected=100, quantity_received=100, is_accepted=True),
        models.ReceiptItem(receipt_id=rcp_3.id, product_id=products_map["CIRCUIT-001"].id, quantity_expected=500, quantity_received=500, is_accepted=True),
        models.ReceiptItem(receipt_id=rcp_4.id, product_id=products_map["DRILL-001"].id, quantity_expected=150),
        models.ReceiptItem(receipt_id=rcp_5.id, product_id=products_map["RES-001"].id, quantity_expected=1000),
    ]
    db.add_all(rcp_items)
    db.commit()

    # ==========================================
    # 7. DELIVERIES (3 Records)
    # ==========================================
    dlv_1 = models.Delivery(
        delivery_number="DEL-2024-001", customer_id="Tesla Gigafactory", warehouse_id=wh_austin.id,
        status="SHIPPED", order_date=now - timedelta(days=4), planned_delivery_date=now - timedelta(days=1),
        actual_delivery_date=now - timedelta(days=1), created_by="soha@fluxo.com"
    )
    dlv_2 = models.Delivery(
        delivery_number="DEL-2024-002", customer_id="SpaceX Depot", warehouse_id=wh_dallas.id,
        status="PACKED", order_date=now - timedelta(days=1), planned_delivery_date=now + timedelta(days=1),
        created_by="alex@fluxo.com"
    )
    dlv_3 = models.Delivery(
        delivery_number="DEL-2024-003", customer_id="Apple Austin Campus", warehouse_id=wh_austin.id,
        status="PICKING", order_date=now, planned_delivery_date=now + timedelta(days=2),
        created_by="soha@fluxo.com"
    )
    db.add_all([dlv_1, dlv_2, dlv_3])
    db.commit()

    dlv_items = [
        models.DeliveryItem(delivery_id=dlv_1.id, product_id=products_map["ALU-001"].id, quantity_ordered=40, quantity_picked=40, quantity_packed=40, quantity_shipped=40, status="SHIPPED"),
        models.DeliveryItem(delivery_id=dlv_2.id, product_id=products_map["CIRCUIT-001"].id, quantity_ordered=50, quantity_picked=50, quantity_packed=50, status="PACKED"),
        models.DeliveryItem(delivery_id=dlv_3.id, product_id=products_map["STEEL-001"].id, quantity_ordered=20, quantity_picked=20, status="PICKED"),
    ]
    db.add_all(dlv_items)
    db.commit()

    # ==========================================
    # 8. INTERNAL TRANSFERS (2 Records)
    # ==========================================
    trn_1 = models.InternalTransfer(
        transfer_number="TRN-2024-001", product_id=products_map["CIRCUIT-001"].id,
        from_warehouse_id=wh_austin.id, to_warehouse_id=wh_dallas.id,
        quantity=15, status="COMPLETED", initiated_date=now - timedelta(days=3),
        completed_date=now - timedelta(days=2), created_by="soha@fluxo.com"
    )
    trn_2 = models.InternalTransfer(
        transfer_number="TRN-2024-002", product_id=products_map["STEEL-001"].id,
        from_warehouse_id=wh_dallas.id, to_warehouse_id=wh_reno.id,
        quantity=50, status="PENDING", initiated_date=now,
        created_by="alex@fluxo.com"
    )
    db.add_all([trn_1, trn_2])
    db.commit()

    # ==========================================
    # 9. STOCK ADJUSTMENTS (2 Records)
    # ==========================================
    adj_1 = models.StockAdjustment(
        adjustment_number="ADJ-2024-001", product_id=products_map["STEEL-001"].id,
        warehouse_id=wh_reno.id, location_id=loc_ren_f1.id, quantity_before=153, quantity_after=150,
        reason="DAMAGED", status="EXECUTED", created_by="manager@fluxo.com"
    )
    adj_2 = models.StockAdjustment(
        adjustment_number="ADJ-2024-002", product_id=products_map["CIRCUIT-001"].id,
        warehouse_id=wh_austin.id, location_id=loc_aus_a1.id, quantity_before=2000, quantity_after=2010,
        reason="RECOUNT", status="DRAFT", created_by="soha@fluxo.com"
    )
    db.add_all([adj_1, adj_2])
    db.commit()

    # ==========================================
    # 10. STOCK LEDGER (50+ IMMUTABLE ENTRIES SPANNING 10 DAYS)
    # ==========================================
    print("[SEED] Generating 50+ StockLedger audit trail entries across 10 days...")
    ledger_entries = []

    # Featured explicit sample operations requested
    sample_ops = [
        (now - timedelta(days=5), products_map["STEEL-001"].id, wh_austin.id, loc_aus_a1.id, "RECEIPT", 500, 750, "RECEIPT", rcp_1.id, "RCP-2024-001", "250 Steel Rods received in Austin"),
        (now - timedelta(days=4), products_map["ALU-001"].id, wh_austin.id, loc_aus_a3.id, "DELIVERY", 460, 420, "DELIVERY", dlv_1.id, "DEL-2024-001", "40 Aluminum Sheets shipped to customer"),
        (now - timedelta(days=3), products_map["CIRCUIT-001"].id, wh_austin.id, loc_aus_a1.id, "TRANSFER_OUT", 2015, 2000, "TRANSFER", trn_1.id, "TRN-2024-001", "15 Circuit Boards transferred to Dallas"),
        (now - timedelta(days=3), products_map["CIRCUIT-001"].id, wh_dallas.id, loc_dal_d2.id, "TRANSFER_IN", 1185, 1200, "TRANSFER", trn_1.id, "TRN-2024-001", "15 Circuit Boards received from Austin"),
        (now - timedelta(days=2), products_map["STEEL-001"].id, wh_reno.id, loc_ren_f1.id, "ADJUSTMENT", 153, 150, "ADJUSTMENT", adj_1.id, "ADJ-2024-001", "3 kg Steel damaged - adjustment in Reno"),
        (now - timedelta(days=2), products_map["CHAIR-001"].id, wh_dallas.id, loc_dal_d1.id, "RECEIPT", 0, 100, "RECEIPT", rcp_2.id, "RCP-2024-002", "100 Chairs received in Dallas"),
    ]

    for dt, p_id, w_id, l_id, op_type, q_bef, q_aft, r_type, r_id, r_num, notes in sample_ops:
        entry = models.StockLedger(
            created_at=dt, product_id=p_id, warehouse_id=w_id, location_id=l_id,
            operation_type=op_type, quantity_before=q_bef, quantity_after=q_aft,
            reference_type=r_type, reference_id=r_id, reference_number=r_num,
            notes=notes, created_by="soha@fluxo.com"
        )
        ledger_entries.append(entry)

    # Generate additional 45+ historical transactions over the past 10 days
    op_types = ["RECEIPT", "DELIVERY", "TRANSFER_OUT", "TRANSFER_IN", "ADJUSTMENT", "COUNT"]
    users = ["soha@fluxo.com", "alex@fluxo.com", "manager@fluxo.com", "operator@fluxo.com"]

    for i in range(1, 48):
        day_offset = random.randint(0, 9)
        entry_time = now - timedelta(days=day_offset, hours=random.randint(1, 23), minutes=random.randint(0, 59))
        p = list(products_map.values())[i % len(products_map)]
        wh = random.choice([wh_austin, wh_dallas, wh_reno])
        op = random.choice(op_types)
        
        bef = random.randint(100, 2000)
        delta = random.randint(10, 150) * (1 if op in ["RECEIPT", "TRANSFER_IN"] else -1)
        aft = max(0, bef + delta)

        entry = models.StockLedger(
            created_at=entry_time,
            product_id=p.id,
            warehouse_id=wh.id,
            location_id=None,
            operation_type=op,
            quantity_before=bef,
            quantity_after=aft,
            reference_type="MANUAL",
            reference_id=generate_uuid(),
            reference_number=f"REF-2024-{1000 + i}",
            notes=f"Automated inventory ledger log #{i}",
            created_by=random.choice(users)
        )
        ledger_entries.append(entry)

    db.add_all(ledger_entries)
    db.commit()

    print("[SEED] Successfully completed seeding 20 products, 3 warehouses, 13 locations, 5 suppliers, 5 receipts, 3 deliveries, 2 transfers, 2 adjustments, and 54 StockLedger audit entries!")
    db.close()

def generate_uuid():
    import uuid
    return str(uuid.uuid4())

if __name__ == "__main__":
    seed_db()
