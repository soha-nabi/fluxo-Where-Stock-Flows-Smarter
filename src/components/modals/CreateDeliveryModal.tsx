"use client";

import React, { useEffect, useState } from "react";
import { useDeliveryStore, useProductStore } from "@/store";
import { warehousesApi, Warehouse, DeliveryItemInput } from "@/lib/api";
import { ArrowUpRight, X, Plus, Trash2, Save, RefreshCw, AlertCircle } from "lucide-react";

interface CreateDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateDeliveryModal({ isOpen, onClose, onSuccess }: CreateDeliveryModalProps) {
  const { createDelivery } = useDeliveryStore();
  const { products, fetchProducts } = useProductStore();

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [customerId, setCustomerId] = useState("CUST-901 (Global Logistics)");
  const [warehouseId, setWarehouseId] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<DeliveryItemInput[]>([]);

  const [selectedProductId, setSelectedProductId] = useState("");
  const [inputQty, setInputQty] = useState(5);
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

  const handleAddItem = () => {
    if (!selectedProductId) return;
    if (items.some((it) => it.product_id === selectedProductId)) {
      setErrorMsg("This product is already added.");
      return;
    }
    setErrorMsg("");
    setItems([...items, { product_id: selectedProductId, quantity_ordered: inputQty }]);
    setSelectedProductId("");
    setInputQty(5);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warehouseId || items.length === 0) {
      setErrorMsg("Warehouse and at least one item are required.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    try {
      await createDelivery({ customer_id: customerId, warehouse_id: warehouseId, items, notes });
      setSubmitting(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to create delivery.");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#121422] border border-[#262942] w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-[#20233b] pb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-purple-400" /> Create Outbound Delivery Order
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
              <label className="block text-gray-400 mb-1">Customer</label>
              <input
                type="text"
                required
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Dispatch Warehouse</label>
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
            <span className="font-bold text-gray-300 block">Add Item to Dispatch</span>
            <div className="grid grid-cols-3 gap-2">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
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
                value={inputQty}
                onChange={(e) => setInputQty(Number(e.target.value))}
                className="px-3 py-1.5 rounded-lg bg-[#181a2e] border border-[#2b2f4c] text-white font-mono"
              />
            </div>
            <button
              type="button"
              onClick={handleAddItem}
              className="w-full py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold"
            >
              Add Item
            </button>
          </div>

          {items.length > 0 && (
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {items.map((it, idx) => {
                const prod = products.find((p) => p.id === it.product_id);
                return (
                  <div key={idx} className="p-2 rounded-lg bg-[#181a2e] flex justify-between items-center text-xs">
                    <span className="text-white font-bold">{prod?.name || it.product_id} ({it.quantity_ordered} units)</span>
                    <button type="button" onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-[#20233b]">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-[#1c1f33] text-gray-300">Cancel</button>
            <button type="submit" disabled={submitting} className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold flex items-center gap-2">
              {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
              <Save className="w-4 h-4" /> Save Delivery
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
