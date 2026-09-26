"use client";

import React, { useEffect, useState } from "react";
import { TransferInput, Warehouse, Product } from "@/lib/api";
import { Save, RefreshCw } from "lucide-react";

interface TransferFormProps {
  warehouses: Warehouse[];
  products: Product[];
  onSubmit: (data: TransferInput) => Promise<void>;
  onCancel?: () => void;
}

export function TransferForm({ warehouses, products, onSubmit, onCancel }: TransferFormProps) {
  const [fromWarehouseId, setFromWarehouseId] = useState(warehouses[0]?.id || "");
  const [toWarehouseId, setToWarehouseId] = useState(warehouses[1]?.id || warehouses[0]?.id || "");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(25);
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (warehouses.length >= 2) {
      if (!fromWarehouseId) setFromWarehouseId(warehouses[0].id);
      if (!toWarehouseId) setToWarehouseId(warehouses[1].id);
    }
  }, [warehouses, fromWarehouseId, toWarehouseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fromWarehouseId === toWarehouseId) {
      alert("Source and destination warehouses cannot be the same.");
      return;
    }
    setLoading(true);
    await onSubmit({
      product_id: selectedProductId,
      from_warehouse_id: fromWarehouseId,
      to_warehouse_id: toWarehouseId,
      quantity,
      notes,
    });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-400 mb-1">From Warehouse</label>
          <select
            required
            value={fromWarehouseId}
            onChange={(e) => setFromWarehouseId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white"
          >
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-400 mb-1">To Warehouse</label>
          <select
            required
            value={toWarehouseId}
            onChange={(e) => setToWarehouseId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white"
          >
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-400 mb-1">Product SKU</label>
          <select
            required
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white"
          >
            <option value="">-- Choose Product --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-400 mb-1">Transfer Qty</label>
          <input
            type="number"
            min="1"
            required
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white font-mono"
          />
        </div>
      </div>

      <div>
        <label className="block text-gray-400 mb-1">Notes</label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white"
        />
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t border-[#20233b]">
        {onCancel && <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl bg-[#1c1f33] text-gray-300">Cancel</button>}
        <button type="submit" disabled={loading} className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold flex items-center gap-2">
          {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
          <Save className="w-4 h-4" /> Save Transfer
        </button>
      </div>
    </form>
  );
}
