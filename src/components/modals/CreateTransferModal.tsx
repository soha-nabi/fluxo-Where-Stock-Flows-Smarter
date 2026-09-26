"use client";

import React, { useEffect, useState } from "react";
import { useTransferStore, useProductStore } from "@/store";
import { warehousesApi, Warehouse } from "@/lib/api";
import { Repeat, X, Save, RefreshCw, AlertCircle } from "lucide-react";

interface CreateTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateTransferModal({ isOpen, onClose, onSuccess }: CreateTransferModalProps) {
  const { createTransfer } = useTransferStore();
  const { products, fetchProducts } = useProductStore();

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [fromWarehouseId, setFromWarehouseId] = useState("");
  const [toWarehouseId, setToWarehouseId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(25);
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      warehousesApi.getWarehouses().then((res) => {
        const list = res || [];
        setWarehouses(list);
        if (list.length >= 2) {
          setFromWarehouseId(list[0].id);
          setToWarehouseId(list[1].id);
        }
      });
    }
  }, [isOpen, fetchProducts]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fromWarehouseId === toWarehouseId) {
      setErrorMsg("Source and destination warehouses cannot be identical.");
      return;
    }
    if (!selectedProductId || quantity <= 0) {
      setErrorMsg("Product and positive quantity are required.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    try {
      await createTransfer({
        product_id: selectedProductId,
        from_warehouse_id: fromWarehouseId,
        to_warehouse_id: toWarehouseId,
        quantity,
        notes,
      });
      setSubmitting(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to create transfer.");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#121422] border border-[#262942] w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-[#20233b] pb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Repeat className="w-5 h-5 text-purple-400" /> Create Inter-Warehouse Transfer
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
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-[#1c1f33] text-gray-300">Cancel</button>
            <button type="submit" disabled={submitting} className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold flex items-center gap-2">
              {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
              <Save className="w-4 h-4" /> Save Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
