"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useAdjustmentStore, useProductStore } from "@/store";
import { warehousesApi, Warehouse } from "@/lib/api";
import {
  ArrowLeft,
  Sliders,
  AlertCircle,
  RefreshCw,
  Save,
} from "lucide-react";

export default function CreateAdjustmentPage() {
  const router = useRouter();
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
    fetchProducts();
    warehousesApi.getWarehouses().then((res) => {
      const list = res || [];
      setWarehouses(list);
      if (list.length > 0) setWarehouseId(list[0].id);
    });
  }, [fetchProducts]);

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const systemQty = selectedProduct?.total_stock || 0;
  const calculatedDiff = physicalCount - systemQty;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warehouseId) {
      setErrorMsg("Please select a target warehouse.");
      return;
    }
    if (!selectedProductId) {
      setErrorMsg("Please select a product SKU for reconciliation.");
      return;
    }
    if (physicalCount < 0) {
      setErrorMsg("Physical count cannot be negative.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const created = await createAdjustment({
        product_id: selectedProductId,
        warehouse_id: warehouseId,
        physical_count: physicalCount,
        reason,
        notes,
      });

      if (created) {
        router.push(`/adjustments/${created.id}`);
      } else {
        router.push("/adjustments");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to create adjustment order.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/adjustments" className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Back to Adjustments
          </Link>
        </div>

        <div className="bg-[#121422] border border-[#212438] p-6 rounded-2xl shadow-xl space-y-6">
          <div className="flex items-center gap-4 border-b border-[#20233b] pb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Create Stock Audit Reconciliation</h1>
              <p className="text-xs text-gray-400">Record physical count audits and variance reason codes.</p>
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
                <label className="block text-gray-400 mb-1 font-medium">Target Warehouse *</label>
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

              <div>
                <label className="block text-gray-400 mb-1 font-medium">Product SKU *</label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    const p = products.find((prod) => prod.id === e.target.value);
                    if (p) setPhysicalCount(p.total_stock || 0);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">-- Choose Product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sku} — {p.name} (Current Stock: {p.total_stock || 0})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* System Qty vs Physical Audit Box */}
            <div className="p-5 rounded-xl bg-[#16182a] border border-[#242742] space-y-4">
              <h3 className="text-xs font-bold text-gray-300">Count Comparison Telemetry</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div className="p-3 rounded-lg bg-[#121422] border border-[#22253d] text-center">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">System Registered Qty</span>
                  <span className="font-mono text-xl font-bold text-white block mt-1">{systemQty}</span>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-medium">Audit Physical Count *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={physicalCount}
                    onChange={(e) => setPhysicalCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white font-mono text-base font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="p-3 rounded-lg bg-[#121422] border border-[#22253d] text-center">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Calculated Variance</span>
                  <span className={`font-mono text-xl font-bold block mt-1 ${calculatedDiff >= 0 ? "text-emerald-400" : "text-amber-400"}`}>
                    {calculatedDiff > 0 ? `+${calculatedDiff}` : calculatedDiff}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 mb-1 font-medium">Variance Reason Code *</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="RECOUNT">RECOUNT / AUDIT</option>
                  <option value="DAMAGED">DAMAGED / SPOILED</option>
                  <option value="LOST">LOST / MISSING</option>
                  <option value="MISCOUNT">PREVIOUS MISCOUNT</option>
                  <option value="THEFT">THEFT / SHRINKAGE</option>
                  <option value="EXPIRATION">EXPIRATION</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">Audit Notes & Observations</label>
                <textarea
                  rows={2}
                  placeholder="Notes explaining physical variance..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#20233b]">
              <Link href="/adjustments" className="px-4 py-2.5 rounded-xl bg-[#1c1f33] text-gray-300">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-bold flex items-center gap-2 shadow-lg shadow-purple-900/40"
              >
                {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                <Save className="w-4 h-4" />
                <span>Save Draft Adjustment</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
