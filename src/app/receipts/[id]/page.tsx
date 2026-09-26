"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useReceiptStore } from "@/store";
import {
  ArrowLeft,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  Boxes,
  AlertCircle,
  RefreshCw,
  Trash2,
  X,
  Sliders,
} from "lucide-react";

export default function ReceiptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const {
    selectedReceipt,
    fetchReceipt,
    receiveItems,
    validateReceipt,
    completeReceipt,
    deleteReceipt,
    loading,
    error,
    clearError,
  } = useReceiptStore();

  // Modal for receiving quantities
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [receivedInputs, setReceivedInputs] = useState<Record<string, number>>({});
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchReceipt(id);
  }, [id, fetchReceipt]);

  useEffect(() => {
    if (selectedReceipt?.items) {
      const initialMap: Record<string, number> = {};
      selectedReceipt.items.forEach((item) => {
        initialMap[item.id] = item.quantity_received || item.quantity_expected;
      });
      setReceivedInputs(initialMap);
    }
  }, [selectedReceipt]);

  const handleReceiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReceipt?.items) return;
    setActionLoading(true);

    const payload = selectedReceipt.items.map((item) => ({
      receipt_item_id: item.id,
      quantity_received: Number(receivedInputs[item.id] || 0),
    }));

    await receiveItems(id, payload);
    setActionLoading(false);
    setIsReceiveOpen(false);
  };

  const handleValidate = async () => {
    setActionLoading(true);
    await validateReceipt(id);
    setActionLoading(false);
  };

  const handleComplete = async () => {
    setActionLoading(true);
    await completeReceipt(id);
    setActionLoading(false);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this goods receipt?")) {
      setActionLoading(true);
      await deleteReceipt(id);
      setActionLoading(false);
      router.push("/receipts");
    }
  };

  if (loading && !selectedReceipt) {
    return (
      <AppShell>
        <div className="p-12 text-center text-gray-400 text-xs flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
          <span>Loading receipt details...</span>
        </div>
      </AppShell>
    );
  }

  if (!selectedReceipt && !loading) {
    return (
      <AppShell>
        <div className="p-12 text-center text-gray-400 text-xs flex flex-col items-center gap-4">
          <AlertCircle className="w-10 h-10 text-amber-400" />
          <p className="text-sm font-bold text-white">Receipt Record Not Found</p>
          <Link href="/receipts" className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold">
            Back to Receipts
          </Link>
        </div>
      </AppShell>
    );
  }

  const status = selectedReceipt?.status || "DRAFT";

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header Back Navigation */}
        <div className="flex items-center justify-between">
          <Link href="/receipts" className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Back to Goods Receipts
          </Link>

          <div className="flex items-center gap-3">
            {status === "DRAFT" && (
              <button
                onClick={() => setIsReceiveOpen(true)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2"
              >
                <Boxes className="w-4 h-4" /> Receive Items
              </button>
            )}

            {status === "RECEIVED" && (
              <button
                onClick={handleValidate}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Validate Quality Inspection
              </button>
            )}

            {status === "VALIDATED" && (
              <button
                onClick={handleComplete}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Complete & Update Stock Ledger
              </button>
            )}

            {status === "DRAFT" && (
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="p-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300"
                title="Delete Receipt"
              >
                <Trash2 className="w-4 h-4" />
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

        {/* Receipt Order Identity Banner */}
        <div className="bg-[#121422] border border-[#212438] p-6 rounded-2xl shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <ArrowDownLeft className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-3">
                  Receipt: {selectedReceipt?.receipt_number}
                  <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-800/50">
                    Status: {status}
                  </span>
                </h1>
                <p className="text-xs text-gray-400 mt-1">
                  Supplier: <strong className="text-gray-200">{selectedReceipt?.supplier_name || selectedReceipt?.supplier_id}</strong> | Destination: <strong className="text-gray-200">{selectedReceipt?.warehouse_name || selectedReceipt?.warehouse_id}</strong>
                </p>
              </div>
            </div>

            <div className="text-left md:text-right text-xs font-mono text-gray-400 space-y-1">
              <div>Created At: {new Date(selectedReceipt?.created_at || "").toLocaleString()}</div>
              <div>Expected Date: {new Date(selectedReceipt?.expected_date || "").toLocaleDateString()}</div>
            </div>
          </div>

          {/* Workflow Status Timeline Pipeline */}
          <div className="grid grid-cols-4 gap-2 pt-4 border-t border-[#20233b]">
            {["DRAFT", "RECEIVED", "VALIDATED", "COMPLETED"].map((step, idx) => {
              const currentIdx = ["DRAFT", "RECEIVED", "VALIDATED", "COMPLETED"].indexOf(status);
              const isDone = currentIdx >= idx;
              const isCurrent = currentIdx === idx;

              return (
                <div key={step} className={`p-3 rounded-xl border text-center transition-all ${
                  isCurrent
                    ? "bg-purple-950/60 border-purple-500 text-purple-200 shadow-lg shadow-purple-900/30"
                    : isDone
                    ? "bg-emerald-950/40 border-emerald-800/50 text-emerald-300"
                    : "bg-[#16182a] border-[#22253d] text-gray-500"
                }`}>
                  <span className="text-[10px] font-mono block mb-0.5 font-bold">STEP {idx + 1}</span>
                  <span className="text-xs font-bold block">{step}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Receipt Items Table */}
        <div className="bg-[#121422] border border-[#212438] rounded-2xl overflow-hidden shadow-xl space-y-4 p-6">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" /> Receipt Items Breakdown
          </h3>

          <div className="overflow-x-auto border border-[#20233b] rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#17192b] text-[11px] font-semibold text-gray-400 uppercase border-b border-[#23263b]">
                  <th className="py-3 px-4">Product ID / Name</th>
                  <th className="py-3 px-4">Expected Qty</th>
                  <th className="py-3 px-4">Received Qty</th>
                  <th className="py-3 px-4">Inspection Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2136] text-xs">
                {selectedReceipt?.items && selectedReceipt.items.length > 0 ? (
                  selectedReceipt.items.map((item) => (
                    <tr key={item.id} className="hover:bg-[#181a2e]">
                      <td className="py-3 px-4 font-bold text-white">
                        {item.product_name || item.product_id}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-purple-300">
                        {item.quantity_expected} units
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                        {item.quantity_received !== undefined && item.quantity_received !== null ? `${item.quantity_received} units` : "Pending Inspection"}
                      </td>
                      <td className="py-3 px-4">
                        {status === "COMPLETED" ? (
                          <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Accepted & Put Away
                          </span>
                        ) : status === "VALIDATED" ? (
                          <span className="text-purple-300 font-bold text-[10px] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Quality Verified
                          </span>
                        ) : (
                          <span className="text-gray-400 font-mono text-[10px] flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> In Inspection Pipeline
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-gray-500 italic">
                      No line items attached to this receipt.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Receive Items Modal */}
      {isReceiveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121422] border border-[#262942] w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#20233b] pb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Boxes className="w-4 h-4 text-purple-400" /> Confirm Physical Quantities Received
              </h3>
              <button onClick={() => setIsReceiveOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReceiveSubmit} className="space-y-4 text-xs">
              {selectedReceipt?.items?.map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-[#16182a] border border-[#242742] space-y-2">
                  <div className="flex justify-between font-bold text-white">
                    <span>{item.product_name || item.product_id}</span>
                    <span className="text-gray-400 font-mono">Expected: {item.quantity_expected}</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={receivedInputs[item.id] || 0}
                    onChange={(e) => setReceivedInputs({ ...receivedInputs, [item.id]: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#181a2e] border border-[#2b2f4c] text-white font-mono text-xs"
                  />
                </div>
              ))}

              <div className="flex items-center justify-end gap-3 pt-3">
                <button type="button" onClick={() => setIsReceiveOpen(false)} className="px-4 py-2 rounded-xl bg-[#1c1f33] text-gray-300">
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading} className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2">
                  {actionLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>Save Received Quantities</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
