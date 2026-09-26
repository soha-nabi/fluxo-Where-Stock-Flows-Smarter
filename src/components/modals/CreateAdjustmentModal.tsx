"use client";

import React, { useEffect, useState } from "react";
import { useAdjustmentStore, useProductStore } from "@/store";
import { warehousesApi, Warehouse } from "@/lib/api";
import { Sliders, X, Save, RefreshCw, AlertCircle } from "lucide-react";

interface CreateAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateAdjustmentModal({ isOpen, onClose, onSuccess }: CreateAdjustmentModalProps) {
  const { createAdjustment } = useAdjustmentStore();
  const { products, fetchProducts } = useProductStore();

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehouseId, setWarehouseId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [physicalCount, setPhysicalCount] = useState<number>(0);
  const [reason, setReason] = useState("RECOUNT");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      warehousesApi.getWarehouses().then((res) => {
        const list = res || [];
        setWarehouses(list);
        if (list.length > 0) setWarehouseId(list[0].id);
      });
    }
  }, [isOpen, fetchProducts]);

  if (!isOpen) return null;

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const systemQty = selectedProduct?.total_stock || 0;
  const calculatedDiff = physicalCount - systemQty;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warehouseId || !selectedProductId) {
      setErrorMsg("Warehouse and Product selection are required.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    try {
      await createAdjustment({
        product_id: selectedProductId,
        warehouse_id: warehouseId,
        physical_count: physicalCount,
        reason,
        notes,
      });
      setSubmitting(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to create adjustment.");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#121422] border border-[#262942] w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-[#20233b] pb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-purple-400" /> Create Stock Audit Adjustment
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

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
              <label className="block text-gray-400 mb-1">Audit Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#20233b]">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-[#1c1f33] text-gray-300">Cancel</button>
            <button type="submit" disabled={submitting} className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold flex items-center gap-2">
              {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
              <Save className="w-4 h-4" /> Save Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
