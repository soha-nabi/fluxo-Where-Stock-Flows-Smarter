"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useDeliveryStore } from "@/store";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Truck,
  Box,
  Layers,
  AlertCircle,
  RefreshCw,
  XCircle,
  X,
  Sliders,
} from "lucide-react";

export default function DeliveryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const {
    selectedDelivery,
    fetchDelivery,
    pickItems,
    packItems,
    shipDelivery,
    cancelDelivery,
    loading,
    error,
    clearError,
  } = useDeliveryStore();

  const [isPickOpen, setIsPickOpen] = useState(false);
  const [isPackOpen, setIsPackOpen] = useState(false);
  const [qtyInputs, setQtyInputs] = useState<Record<string, number>>({});
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDelivery(id);
  }, [id, fetchDelivery]);

  useEffect(() => {
    if (selectedDelivery?.items) {
      const initialMap: Record<string, number> = {};
      selectedDelivery.items.forEach((item) => {
        initialMap[item.id] = item.quantity_ordered;
      });
      setQtyInputs(initialMap);
    }
  }, [selectedDelivery]);

  const handlePickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDelivery?.items) return;
    setActionLoading(true);
    const payload = selectedDelivery.items.map((item) => ({
      delivery_item_id: item.id,
      quantity_picked: Number(qtyInputs[item.id] || 0),
    }));
    await pickItems(id, payload);
    setActionLoading(false);
    setIsPickOpen(false);
  };

  const handlePackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDelivery?.items) return;
    setActionLoading(true);
    const payload = selectedDelivery.items.map((item) => ({
      delivery_item_id: item.id,
      quantity_packed: Number(qtyInputs[item.id] || 0),
    }));
    await packItems(id, payload);
    setActionLoading(false);
    setIsPackOpen(false);
  };

  const handleShip = async () => {
    setActionLoading(true);
    await shipDelivery(id);
    setActionLoading(false);
  };

  const handleCancel = async () => {
    if (confirm("Are you sure you want to cancel this delivery order?")) {
      setActionLoading(true);
      await cancelDelivery(id);
      setActionLoading(false);
    }
  };

  if (loading && !selectedDelivery) {
    return (
      <AppShell>
        <div className="p-12 text-center text-gray-400 text-xs flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
          <span>Loading delivery order telemetry...</span>
        </div>
      </AppShell>
    );
  }

  if (!selectedDelivery && !loading) {
    return (
      <AppShell>
        <div className="p-12 text-center text-gray-400 text-xs flex flex-col items-center gap-4">
          <AlertCircle className="w-10 h-10 text-amber-400" />
          <p className="text-sm font-bold text-white">Delivery Order Not Found</p>
          <Link href="/deliveries" className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold">
            Back to Deliveries
          </Link>
        </div>
      </AppShell>
    );
  }

  const status = selectedDelivery?.status || "DRAFT";
  const isCanceled = status === "CANCELED";

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <Link href="/deliveries" className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Back to Outbound Deliveries
          </Link>

          <div className="flex items-center gap-3">
            {(status === "DRAFT" || status === "PICKING") && (
              <button
                onClick={() => setIsPickOpen(true)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-2"
              >
                <Layers className="w-4 h-4" /> Pick Items
              </button>
            )}

            {(status === "PICKED" || status === "PICKING") && (
              <button
                onClick={() => setIsPackOpen(true)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2"
              >
                <Box className="w-4 h-4" /> Pack Parcel Items
              </button>
            )}

            {status === "PACKED" && (
              <button
                onClick={handleShip}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2"
              >
                <Truck className="w-4 h-4" /> Dispatch & Ship Delivery
              </button>
            )}

            {(status === "DRAFT" || status === "PICKING" || status === "PICKED") && (
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="p-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300"
                title="Cancel Order"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={clearError} className="underline text-red-400">
              Dismiss
            </button>
          </div>
        )}

        {/* Order Banner */}
        <div className="bg-[#121422] border border-[#212438] p-6 rounded-2xl shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-3">
                  Delivery: {selectedDelivery?.delivery_number}
                  <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-800/50">
                    Status: {status}
                  </span>
                </h1>
                <p className="text-xs text-gray-400 mt-1">
                  Customer: <strong className="text-gray-200">{selectedDelivery?.customer_id}</strong> | Dispatch Warehouse: <strong className="text-gray-200">{selectedDelivery?.warehouse_name || selectedDelivery?.warehouse_id}</strong>
                </p>
              </div>
            </div>

            <div className="text-left md:text-right text-xs font-mono text-gray-400 space-y-1">
              <div>Order Date: {new Date(selectedDelivery?.order_date || "").toLocaleDateString()}</div>
              <div>Planned Delivery: {new Date(selectedDelivery?.planned_delivery_date || "").toLocaleDateString()}</div>
            </div>
          </div>

          {/* Workflow Pipeline Timeline */}
          {!isCanceled ? (
            <div className="grid grid-cols-4 gap-2 pt-4 border-t border-[#20233b]">
              {["DRAFT", "PICKED", "PACKED", "SHIPPED"].map((step, idx) => {
                const currentIdx = ["DRAFT", "PICKED", "PACKED", "SHIPPED"].indexOf(status === "PICKING" ? "DRAFT" : status === "DELIVERED" ? "SHIPPED" : status);
                const isDone = currentIdx >= idx;
                const isCurrent = currentIdx === idx;

                return (
                  <div
                    key={step}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isCurrent
                        ? "bg-purple-950/60 border-purple-500 text-purple-200 shadow-lg shadow-purple-900/30"
                        : isDone
                        ? "bg-emerald-950/40 border-emerald-800/50 text-emerald-300"
                        : "bg-[#16182a] border-[#22253d] text-gray-500"
                    }`}
                  >
                    <span className="text-[10px] font-mono block mb-0.5 font-bold">STAGE {idx + 1}</span>
                    <span className="text-xs font-bold block">{step}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-center font-bold text-xs">
              ORDER CANCELED
            </div>
          )}
        </div>

        {/* Delivery Line Items Breakdown */}
        <div className="bg-[#121422] border border-[#212438] rounded-2xl overflow-hidden shadow-xl space-y-4 p-6">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" /> Delivery Items Fulfillment Progress
          </h3>

          <div className="overflow-x-auto border border-[#20233b] rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#17192b] text-[11px] font-semibold text-gray-400 uppercase border-b border-[#23263b]">
                  <th className="py-3 px-4">Product ID / Name</th>
                  <th className="py-3 px-4">Ordered Qty</th>
                  <th className="py-3 px-4">Picked Qty</th>
                  <th className="py-3 px-4">Packed Qty</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2136] text-xs">
                {selectedDelivery?.items && selectedDelivery.items.length > 0 ? (
                  selectedDelivery.items.map((item) => (
                    <tr key={item.id} className="hover:bg-[#181a2e]">
                      <td className="py-3 px-4 font-bold text-white">
                        {item.product_name || item.product_id}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-purple-300">
                        {item.quantity_ordered} units
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">
                        {item.quantity_picked || 0} units
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                        {item.quantity_packed || 0} units
                      </td>
                      <td className="py-3 px-4 font-bold text-[10px]">
                        {status === "SHIPPED" || status === "DELIVERED" ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5" /> Dispatched
                          </span>
                        ) : (
                          <span className="text-gray-400 flex items-center gap-1 font-mono">
                            <Clock className="w-3.5 h-3.5" /> In Fulfillment
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-500 italic">
                      No item lines attached to this delivery.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pick Modal */}
      {isPickOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121422] border border-[#262942] w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#20233b] pb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" /> Enter Picked Items Quantities
              </h3>
              <button onClick={() => setIsPickOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePickSubmit} className="space-y-4 text-xs">
              {selectedDelivery?.items?.map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-[#16182a] border border-[#242742] space-y-2">
                  <div className="flex justify-between font-bold text-white">
                    <span>{item.product_name || item.product_id}</span>
                    <span className="text-gray-400 font-mono">Ordered: {item.quantity_ordered}</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={qtyInputs[item.id] || 0}
                    onChange={(e) => setQtyInputs({ ...qtyInputs, [item.id]: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#181a2e] border border-[#2b2f4c] text-white font-mono text-xs"
                  />
                </div>
              ))}

              <div className="flex items-center justify-end gap-3 pt-3">
                <button type="button" onClick={() => setIsPickOpen(false)} className="px-4 py-2 rounded-xl bg-[#1c1f33] text-gray-300">
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading} className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center gap-2">
                  {actionLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>Save Picked Quantities</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pack Modal */}
      {isPackOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121422] border border-[#262942] w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#20233b] pb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Box className="w-4 h-4 text-purple-400" /> Enter Packed Box Quantities
              </h3>
              <button onClick={() => setIsPackOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePackSubmit} className="space-y-4 text-xs">
              {selectedDelivery?.items?.map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-[#16182a] border border-[#242742] space-y-2">
                  <div className="flex justify-between font-bold text-white">
                    <span>{item.product_name || item.product_id}</span>
                    <span className="text-gray-400 font-mono">Picked: {item.quantity_picked || item.quantity_ordered}</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={qtyInputs[item.id] || 0}
                    onChange={(e) => setQtyInputs({ ...qtyInputs, [item.id]: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#181a2e] border border-[#2b2f4c] text-white font-mono text-xs"
                  />
                </div>
              ))}

              <div className="flex items-center justify-end gap-3 pt-3">
                <button type="button" onClick={() => setIsPackOpen(false)} className="px-4 py-2 rounded-xl bg-[#1c1f33] text-gray-300">
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading} className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-2">
                  {actionLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>Save Packed Quantities</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
