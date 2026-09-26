"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useTransferStore, useProductStore } from "@/store";
import { warehousesApi, Warehouse } from "@/lib/api";
import {
  ArrowLeft,
  Repeat,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Save,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export default function CreateTransferPage() {
  const router = useRouter();
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
    fetchProducts();
    warehousesApi.getWarehouses().then((res) => {
      const list = res || [];
      setWarehouses(list);
      if (list.length >= 2) {
        setFromWarehouseId(list[0].id);
        setToWarehouseId(list[1].id);
      }
    });
  }, [fetchProducts]);

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const availableStock = selectedProduct?.total_stock || 0;
  const isSameWarehouse = fromWarehouseId && toWarehouseId && fromWarehouseId === toWarehouseId;
  const isOverQuantity = quantity > availableStock;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromWarehouseId || !toWarehouseId) {
      setErrorMsg("Please select both source and destination warehouses.");
      return;
    }
    if (isSameWarehouse) {
      setErrorMsg("Source and destination warehouses cannot be identical.");
      return;
    }
    if (!selectedProductId) {
      setErrorMsg("Please select a product SKU to transfer.");
      return;
    }
    if (quantity <= 0) {
      setErrorMsg("Transfer quantity must be greater than zero.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const created = await createTransfer({
        product_id: selectedProductId,
        from_warehouse_id: fromWarehouseId,
        to_warehouse_id: toWarehouseId,
        quantity,
        notes,
      });

      if (created) {
        router.push(`/transfers/${created.id}`);
      } else {
        router.push("/transfers");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to create transfer order.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/transfers" className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Back to Transfers
          </Link>
        </div>

        <div className="bg-[#121422] border border-[#212438] p-6 rounded-2xl shadow-xl space-y-6">
          <div className="flex items-center gap-4 border-b border-[#20233b] pb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Create Inter-Warehouse Stock Transfer</h1>
              <p className="text-xs text-gray-400">Relocate SKU inventory between operational node warehouses.</p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            {/* Route Selection */}
            <div className="p-4 rounded-xl bg-[#16182a] border border-[#242742] space-y-4">
              <h3 className="text-xs font-bold text-gray-300">Warehouse Route Definition</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-gray-400 mb-1 font-medium">Source Warehouse (From) *</label>
                  <select
                    required
                    value={fromWarehouseId}
                    onChange={(e) => setFromWarehouseId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white focus:outline-none focus:border-purple-500"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-medium">Destination Warehouse (To) *</label>
                  <select
                    required
                    value={toWarehouseId}
                    onChange={(e) => setToWarehouseId(e.target.value)}
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

              {isSameWarehouse && (
                <div className="p-3 rounded-lg bg-amber-950/50 border border-amber-800/60 text-amber-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Warning: Source and Destination warehouses are identical. Please select different warehouses.</span>
                </div>
              )}
            </div>

            {/* Product & Quantity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 mb-1 font-medium">Product SKU *</label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white focus:outline-none focus:border-purple-500"
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
                <label className="block text-gray-400 mb-1 font-medium">Transfer Quantity *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white focus:outline-none focus:border-purple-500 font-mono text-sm"
                />
              </div>
            </div>

            {selectedProduct && (
              <div className="p-4 rounded-xl bg-[#141624] border border-[#23263b] flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">{selectedProduct.name}</span>
                  <span className="text-[10px] text-gray-400 font-mono">Reorder level: {selectedProduct.reorder_level}</span>
                </div>
                <div className="text-right">
                  {isOverQuantity ? (
                    <span className="text-amber-400 font-bold text-xs flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Transfer quantity exceeds current system stock ({availableStock})
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Stock Verified ({availableStock} available)
                    </span>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-gray-400 mb-1 font-medium">Transfer Notes & Justification</label>
              <textarea
                rows={3}
                placeholder="Reason for inter-warehouse stock rebalancing..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#20233b]">
              <Link href="/transfers" className="px-4 py-2.5 rounded-xl bg-[#1c1f33] text-gray-300">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting || isSameWarehouse}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-bold flex items-center gap-2 shadow-lg shadow-purple-900/40 disabled:opacity-50"
              >
                {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                <Save className="w-4 h-4" />
                <span>Create Transfer (Pending)</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
