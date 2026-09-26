"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useDeliveryStore, useProductStore } from "@/store";
import { warehousesApi, Warehouse, DeliveryItemInput } from "@/lib/api";
import {
  ArrowLeft,
  ArrowUpRight,
  Plus,
  Trash2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Save,
  CheckCircle2,
} from "lucide-react";

export default function CreateDeliveryPage() {
  const router = useRouter();
  const { createDelivery } = useDeliveryStore();
  const { products, fetchProducts } = useProductStore();

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [customerId, setCustomerId] = useState("CUST-9021 (Global Logistics Corp)");
  const [warehouseId, setWarehouseId] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<DeliveryItemInput[]>([]);

  // Item Input State
  const [selectedProductId, setSelectedProductId] = useState("");
  const [inputQty, setInputQty] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchProducts();
    warehousesApi.getWarehouses().then((res) => {
      setWarehouses(res || []);
      if (res && res.length > 0) setWarehouseId(res[0].id);
    });
  }, [fetchProducts]);

  const handleAddItem = () => {
    if (!selectedProductId) return;
    if (items.some((it) => it.product_id === selectedProductId)) {
      setErrorMsg("This product item has already been added.");
      return;
    }
    setErrorMsg("");
    setItems([
      ...items,
      {
        product_id: selectedProductId,
        quantity_ordered: inputQty,
      },
    ]);
    setSelectedProductId("");
    setInputQty(5);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warehouseId) {
      setErrorMsg("Please select a dispatch warehouse.");
      return;
    }
    if (items.length === 0) {
      setErrorMsg("Please add at least one product item to dispatch.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    try {
      const created = await createDelivery({
        customer_id: customerId,
        warehouse_id: warehouseId,
        items,
        notes,
      });

      if (created) {
        router.push(`/deliveries/${created.id}`);
      } else {
        router.push("/deliveries");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to create delivery order.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/deliveries" className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Back to Deliveries
          </Link>
        </div>

        <div className="bg-[#121422] border border-[#212438] p-6 rounded-2xl shadow-xl space-y-6">
          <div className="flex items-center gap-4 border-b border-[#20233b] pb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Create Outbound Customer Delivery Order</h1>
              <p className="text-xs text-gray-400">Reserve inventory and initiate picking & packing dispatch workflow.</p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 mb-1 font-medium">Customer Reference *</label>
                <input
                  type="text"
                  required
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">Dispatch Warehouse *</label>
                <select
                  required
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white focus:outline-none focus:border-purple-500"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Add Products Input Bar */}
            <div className="p-4 rounded-xl bg-[#16182a] border border-[#242742] space-y-3">
              <h3 className="text-xs font-bold text-gray-300 flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-400" /> Select Products & Validate Inventory Availability
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-gray-400 mb-1 text-[11px]">Choose Product SKU</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white text-xs"
                  >
                    <option value="">-- Choose Product --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.sku} — {p.name} (In Stock: {p.total_stock || 0})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 text-[11px]">Ordered Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={inputQty}
                    onChange={(e) => setInputQty(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white text-xs font-mono"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add Item
                  </button>
                </div>
              </div>
            </div>

            {/* Added Items Table */}
            <div className="bg-[#141624] border border-[#23263b] rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#181a2c] text-[11px] font-semibold text-gray-400 uppercase border-b border-[#23263b]">
                    <th className="py-2.5 px-4">Product SKU & Name</th>
                    <th className="py-2.5 px-4">Ordered Qty</th>
                    <th className="py-2.5 px-4">Stock Availability Check</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2136]">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-gray-500 italic">
                        No products added yet. Add items above.
                      </td>
                    </tr>
                  ) : (
                    items.map((item, idx) => {
                      const prod = products.find((p) => p.id === item.product_id);
                      const available = prod?.total_stock || 0;
                      const isInsufficient = item.quantity_ordered > available;

                      return (
                        <tr key={idx} className="hover:bg-[#181a2e]">
                          <td className="py-3 px-4">
                            <span className="font-bold text-white block">{prod?.name || item.product_id}</span>
                            <span className="text-[10px] text-gray-400 font-mono">SKU: {prod?.sku}</span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-purple-300">
                            {item.quantity_ordered} {prod?.unit || "units"}
                          </td>
                          <td className="py-3 px-4">
                            {isInsufficient ? (
                              <span className="text-[10px] text-amber-400 flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" /> Insufficient Stock ({available} available)
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Stock Available ({available} in system)
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-950/40"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div>
              <label className="block text-gray-400 mb-1 font-medium">Delivery Notes & Shipping Instructions</label>
              <textarea
                rows={3}
                placeholder="Special packing or dispatch guidelines..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#20233b]">
              <Link href="/deliveries" className="px-4 py-2.5 rounded-xl bg-[#1c1f33] text-gray-300">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-bold flex items-center gap-2 shadow-lg shadow-purple-900/40"
              >
                {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                <Save className="w-4 h-4" />
                <span>Create Draft Delivery</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
