"use client";

import React, { useEffect, useState } from "react";
import { ReceiptInput, ReceiptItemInput, Warehouse, Product } from "@/lib/api";
import { Plus, Trash2, Save, RefreshCw } from "lucide-react";

interface ReceiptFormProps {
  warehouses: Warehouse[];
  products: Product[];
  onSubmit: (data: ReceiptInput) => Promise<void>;
  onCancel?: () => void;
}

export function ReceiptForm({ warehouses, products, onSubmit, onCancel }: ReceiptFormProps) {
  const [supplierId, setSupplierId] = useState("SUP-101 (Acme Corp)");
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || "");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ReceiptItemInput[]>([]);

  const [selectedProd, setSelectedProd] = useState("");
  const [qty, setQty] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (warehouses.length > 0 && !warehouseId) setWarehouseId(warehouses[0].id);
  }, [warehouses, warehouseId]);

  const handleAddItem = () => {
    if (!selectedProd) return;
    setItems([...items, { product_id: selectedProd, quantity_expected: qty }]);
    setSelectedProd("");
    setQty(10);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit({ supplier_id: supplierId, warehouse_id: warehouseId, items, notes });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-400 mb-1">Supplier</label>
          <input
            type="text"
            required
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white"
          />
        </div>
        <div>
          <label className="block text-gray-400 mb-1">Warehouse</label>
          <select
            required
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white"
          >
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-[#16182a] border border-[#242742] space-y-2">
        <span className="font-bold text-gray-300 block">Add Item Line</span>
        <div className="grid grid-cols-3 gap-2">
          <select
            value={selectedProd}
            onChange={(e) => setSelectedProd(e.target.value)}
            className="col-span-2 px-3 py-1.5 rounded-lg bg-[#181a2e] border border-[#2b2f4c] text-white"
          >
            <option value="">-- Choose Product --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg bg-[#181a2e] border border-[#2b2f4c] text-white font-mono"
          />
        </div>
        <button type="button" onClick={handleAddItem} className="w-full py-1.5 rounded-lg bg-purple-600 font-bold text-white">
          Add Item
        </button>
      </div>

      {items.length > 0 && (
        <div className="space-y-1">
          {items.map((it, idx) => {
            const p = products.find((prod) => prod.id === it.product_id);
            return (
              <div key={idx} className="p-2 rounded-lg bg-[#181a2e] flex justify-between items-center text-xs">
                <span className="text-white font-bold">{p?.name || it.product_id} ({it.quantity_expected} units)</span>
                <button type="button" onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-red-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-3 border-t border-[#20233b]">
        {onCancel && <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl bg-[#1c1f33] text-gray-300">Cancel</button>}
        <button type="submit" disabled={loading} className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold flex items-center gap-2">
          {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
          <Save className="w-4 h-4" /> Save Receipt
        </button>
      </div>
    </form>
  );
}
