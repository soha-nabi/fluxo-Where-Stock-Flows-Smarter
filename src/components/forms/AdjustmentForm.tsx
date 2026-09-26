"use client";

import React, { useEffect, useState } from "react";
import { AdjustmentInput, Warehouse, Product } from "@/lib/api";
import { Save, RefreshCw } from "lucide-react";

interface AdjustmentFormProps {
  warehouses: Warehouse[];
  products: Product[];
  onSubmit: (data: AdjustmentInput) => Promise<void>;
  onCancel?: () => void;
}

export function AdjustmentForm({ warehouses, products, onSubmit, onCancel }: AdjustmentFormProps) {
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || "");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [physicalCount, setPhysicalCount] = useState<number>(0);
  const [reason, setReason] = useState("RECOUNT");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (warehouses.length > 0 && !warehouseId) setWarehouseId(warehouses[0].id);
  }, [warehouses, warehouseId]);

  const selectedProd = products.find((p) => p.id === selectedProductId);
  const systemQty = selectedProd?.total_stock || 0;
  const calculatedDiff = physicalCount - systemQty;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit({
      product_id: selectedProductId,
      warehouse_id: warehouseId,
      physical_count: physicalCount,
      reason,
      notes,
    });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-400 mb-1">Target Warehouse</label>
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

        <div>
          <label className="block text-gray-400 mb-1">Product SKU</label>
          <select
            required
            value={selectedProductId}
            onChange={(e) => {
              setSelectedProductId(e.target.value);
              const p = products.find((prod) => prod.id === e.target.value);
              if (p) setPhysicalCount(p.total_stock || 0);
            }}
            className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white"
          >
            <option value="">-- Choose Product --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-[#16182a] border border-[#242742] grid grid-cols-3 gap-3 text-center">
        <div>
          <span className="text-[10px] text-gray-400 block">System Qty</span>
          <span className="font-mono text-base font-bold text-white">{systemQty}</span>
        </div>
        <div>
          <label className="block text-gray-400 text-[10px] mb-1">Physical Count</label>
          <input
            type="number"
            min="0"
            required
            value={physicalCount}
            onChange={(e) => setPhysicalCount(Number(e.target.value))}
            className="w-full px-2 py-1 rounded-lg bg-[#181a2e] border border-[#2b2f4c] text-white font-mono text-center font-bold"
          />
        </div>
        <div>
          <span className="text-[10px] text-gray-400 block">Variance</span>
          <span className={`font-mono text-base font-bold ${calculatedDiff >= 0 ? "text-emerald-400" : "text-amber-400"}`}>
            {calculatedDiff > 0 ? `+${calculatedDiff}` : calculatedDiff}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-400 mb-1">Reason Code</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white"
          >
            <option value="RECOUNT">RECOUNT</option>
            <option value="DAMAGED">DAMAGED</option>
            <option value="LOST">LOST</option>
            <option value="MISCOUNT">MISCOUNT</option>
            <option value="THEFT">THEFT</option>
            <option value="EXPIRATION">EXPIRATION</option>
            <option value="OTHER">OTHER</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-400 mb-1">Notes</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t border-[#20233b]">
        {onCancel && <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl bg-[#1c1f33] text-gray-300">Cancel</button>}
        <button type="submit" disabled={loading} className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold flex items-center gap-2">
          {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
          <Save className="w-4 h-4" /> Save Adjustment
        </button>
      </div>
    </form>
  );
}
