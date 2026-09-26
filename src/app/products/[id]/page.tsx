"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useProductStore } from "@/store";
import { ledgerApi, productsApi, StockData, LedgerEntry, ProductInput } from "@/lib/api";
import {
  Package,
  ArrowLeft,
  Warehouse,
  History,
  Edit,
  Save,
  X,
  AlertTriangle,
  Boxes,
  RefreshCw,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { selectedProduct, fetchProduct, updateProduct, loading, error } = useProductStore();

  const [stockLocations, setStockLocations] = useState<StockData[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(true);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ProductInput>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProduct(id);

    async function loadStockAndLedger() {
      setLoadingExtras(true);
      try {
        const [stocks, ledger] = await Promise.allSettled([
          productsApi.getProductStock(id),
          ledgerApi.getLedger({ product_id: id }),
        ]);

        if (stocks.status === "fulfilled") setStockLocations(stocks.value || []);
        if (ledger.status === "fulfilled") setLedgerEntries((ledger.value || []).slice(0, 20));
      } catch (err) {
        console.error("Failed to load extra product detail telemetry", err);
      } finally {
        setLoadingExtras(false);
      }
    }

    loadStockAndLedger();
  }, [id, fetchProduct]);

  useEffect(() => {
    if (selectedProduct) {
      setEditForm({
        name: selectedProduct.name,
        category: selectedProduct.category,
        unit: selectedProduct.unit,
        reorder_level: selectedProduct.reorder_level,
        description: selectedProduct.description || "",
        image_url: selectedProduct.image_url || "",
      });
    }
  }, [selectedProduct]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateProduct(id, editForm);
    setSaving(false);
    setIsEditing(false);
  };

  if (loading && !selectedProduct) {
    return (
      <AppShell>
        <div className="p-12 text-center text-gray-400 text-xs flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
          <span>Loading product specifications & telemetry...</span>
        </div>
      </AppShell>
    );
  }

  if (!selectedProduct && !loading) {
    return (
      <AppShell>
        <div className="p-12 text-center text-gray-400 text-xs flex flex-col items-center gap-4">
          <AlertTriangle className="w-10 h-10 text-amber-400" />
          <p className="text-sm font-bold text-white">Product Record Not Found</p>
          <Link href="/products" className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold">
            Back to Catalog
          </Link>
        </div>
      </AppShell>
    );
  }

  const isLowStock = (selectedProduct?.total_stock || 0) <= (selectedProduct?.reorder_level || 0);

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Navigation Back Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products Inventory</span>
          </Link>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-xl bg-[#1b1e33] hover:bg-[#272b47] text-white text-xs font-semibold flex items-center gap-2 border border-[#2c304f] transition-all"
            >
              <Edit className="w-4 h-4 text-purple-400" />
              <span>Edit Product</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl bg-[#1b1e33] text-gray-400 hover:text-white text-xs font-semibold flex items-center gap-2 border border-[#2c304f]"
            >
              <X className="w-4 h-4" />
              <span>Cancel Editing</span>
            </button>
          )}
        </div>

        {/* Product Identity Banner */}
        <div className="bg-[#121422] border border-[#212438] p-6 rounded-2xl shadow-xl space-y-6">
          {!isEditing ? (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-mono font-bold text-xl text-white shadow-xl shadow-purple-900/40 shrink-0">
                  {selectedProduct?.sku.substring(0, 4)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-extrabold text-white">{selectedProduct?.name}</h1>
                    {isLowStock ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-800/60 text-amber-300 text-[10px] font-bold">
                        <AlertTriangle className="w-3 h-3" />
                        Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        Optimal Stock
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-400 font-mono">
                    <span>SKU: <strong className="text-gray-200">{selectedProduct?.sku}</strong></span>
                    <span>•</span>
                    <span>Category: <strong className="text-purple-300">{selectedProduct?.category}</strong></span>
                    <span>•</span>
                    <span>Reorder Level: <strong className="text-amber-400">{selectedProduct?.reorder_level} {selectedProduct?.unit}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 p-4 rounded-xl bg-[#16182a] border border-[#242742]">
                <div className="text-center">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">Total Stock</span>
                  <span className={`text-2xl font-mono font-bold ${isLowStock ? "text-amber-400" : "text-emerald-400"}`}>
                    {selectedProduct?.total_stock || 0}
                  </span>
                  <span className="text-[10px] text-gray-500 block">{selectedProduct?.unit}</span>
                </div>
              </div>
            </div>
          ) : (
            /* Edit Product Form */
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <Edit className="w-4 h-4 text-purple-400" />
                Edit Product Specifications (SKU Code Immutable)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name || ""}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Category</label>
                  <select
                    value={editForm.category || "MATERIALS"}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="MATERIALS">MATERIALS</option>
                    <option value="ELECTRONICS">ELECTRONICS</option>
                    <option value="FURNITURE">FURNITURE</option>
                    <option value="TOOLS">TOOLS</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    value={editForm.unit || "units"}
                    onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Reorder Point Threshold</label>
                  <input
                    type="number"
                    value={editForm.reorder_level || 10}
                    onChange={(e) => setEditForm({ ...editForm, reorder_level: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editForm.description || ""}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#212438]">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-[#1a1d30] text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-2"
                >
                  {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Warehouse Breakdown & Location Telemetry */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Warehouse & Location Stock Distribution */}
          <div className="bg-[#121422] border border-[#212438] p-6 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Warehouse className="w-4 h-4 text-purple-400" />
              Stock Distribution by Warehouse & Location
            </h3>

            {loadingExtras ? (
              <div className="p-8 text-center text-gray-400 text-xs">Loading warehouse breakdown...</div>
            ) : stockLocations.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-xs">No warehouse location data recorded.</div>
            ) : (
              <div className="space-y-3">
                {stockLocations.map((loc, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#16182a] border border-[#242742] flex items-center justify-between text-xs"
                  >
                    <div className="space-y-1">
                      <span className="font-bold text-white block">{loc.warehouse}</span>
                      {loc.location && (
                        <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                          <Layers className="w-3 h-3 text-indigo-400" /> Location: {loc.location}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-emerald-400 text-sm block">
                        {loc.quantity} {selectedProduct?.unit}
                      </span>
                      {loc.reserved !== undefined && (
                        <span className="text-[10px] text-gray-500">Reserved: {loc.reserved}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ledger Movement History */}
          <div className="bg-[#121422] border border-[#212438] p-6 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-purple-400" />
              Recent Stock Movements (Last 20 Ledger Logs)
            </h3>

            {loadingExtras ? (
              <div className="p-8 text-center text-gray-400 text-xs">Loading ledger history...</div>
            ) : ledgerEntries.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-xs">No historical stock movements logged.</div>
            ) : (
              <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                {ledgerEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 rounded-xl bg-[#16182a] border border-[#242742] flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{entry.operation}</span>
                        <span className="text-[10px] text-gray-400 font-mono">Ref: {entry.reference}</span>
                      </div>
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-500" /> {new Date(entry.date).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-right font-mono">
                      <span
                        className={`font-bold block ${
                          entry.quantity_change >= 0 ? "text-emerald-400" : "text-amber-400"
                        }`}
                      >
                        {entry.quantity_change > 0 ? `+${entry.quantity_change}` : entry.quantity_change}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {entry.quantity_before} → {entry.quantity_after}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
