"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useTransferStore } from "@/store";
import {
  ArrowLeft,
  Repeat,
  CheckCircle2,
  Clock,
  Truck,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  XCircle,
} from "lucide-react";

export default function TransferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const {
    selectedTransfer,
    fetchTransfer,
    approveTransfer,
    completeTransfer,
    cancelTransfer,
    loading,
    error,
    clearError,
  } = useTransferStore();

  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTransfer(id);
  }, [id, fetchTransfer]);

  const handleApprove = async () => {
    setActionLoading(true);
    await approveTransfer(id);
    setActionLoading(false);
  };

  const handleComplete = async () => {
    setActionLoading(true);
    await completeTransfer(id);
    setActionLoading(false);
  };

  const handleCancel = async () => {
    if (confirm("Are you sure you want to cancel this transfer order?")) {
      setActionLoading(true);
      await cancelTransfer(id);
      setActionLoading(false);
    }
  };

  if (loading && !selectedTransfer) {
    return (
      <AppShell>
        <div className="p-12 text-center text-gray-400 text-xs flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
          <span>Loading transfer order specifications...</span>
        </div>
      </AppShell>
    );
  }

  if (!selectedTransfer && !loading) {
    return (
      <AppShell>
        <div className="p-12 text-center text-gray-400 text-xs flex flex-col items-center gap-4">
          <AlertCircle className="w-10 h-10 text-amber-400" />
          <p className="text-sm font-bold text-white">Transfer Order Not Found</p>
          <Link href="/transfers" className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold">
            Back to Transfers
          </Link>
        </div>
      </AppShell>
    );
  }

  const status = selectedTransfer?.status || "PENDING";
  const isCanceled = status === "CANCELED";

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <Link href="/transfers" className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Back to Inter-Warehouse Transfers
          </Link>

          <div className="flex items-center gap-3">
            {status === "PENDING" && (
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2"
              >
                <Truck className="w-4 h-4" /> Approve & Dispatch (In Transit)
              </button>
            )}

            {status === "IN_TRANSIT" && (
              <button
                onClick={handleComplete}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Complete & Receive at Destination
              </button>
            )}

            {(status === "PENDING" || status === "IN_TRANSIT") && (
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="p-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300"
                title="Cancel Transfer"
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

        {/* Transfer Order Details Card */}
        <div className="bg-[#121422] border border-[#212438] p-6 rounded-2xl shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Repeat className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-3">
                  Transfer: {selectedTransfer?.transfer_number}
                  <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-800/50">
                    Status: {status}
                  </span>
                </h1>
                <p className="text-xs text-gray-400 mt-1">
                  Product SKU: <strong className="text-purple-300 font-mono">{selectedTransfer?.product_name || selectedTransfer?.product_id}</strong> | Quantity: <strong className="text-white font-mono">{selectedTransfer?.quantity} units</strong>
                </p>
              </div>
            </div>

            <div className="text-left md:text-right text-xs font-mono text-gray-400 space-y-1">
              <div>Initiated: {new Date(selectedTransfer?.initiated_date || "").toLocaleString()}</div>
              {selectedTransfer?.completed_date && (
                <div>Completed: {new Date(selectedTransfer.completed_date).toLocaleString()}</div>
              )}
            </div>
          </div>

          {/* Route Visualizer Banner */}
          <div className="p-5 rounded-xl bg-[#16182a] border border-[#242742] flex items-center justify-around text-center">
            <div className="space-y-1">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">From Source</span>
              <span className="font-bold text-white text-sm block">
                {selectedTransfer?.from_warehouse_name || selectedTransfer?.from_warehouse_id}
              </span>
            </div>

            <div className="flex flex-col items-center gap-1 text-purple-400">
              <span className="text-[10px] font-mono font-bold">{selectedTransfer?.quantity} Units</span>
              <ArrowRight className="w-6 h-6 animate-pulse" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">To Destination</span>
              <span className="font-bold text-white text-sm block">
                {selectedTransfer?.to_warehouse_name || selectedTransfer?.to_warehouse_id}
              </span>
            </div>
          </div>

          {/* Workflow Timeline */}
          {!isCanceled ? (
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#20233b]">
              {["PENDING", "IN_TRANSIT", "COMPLETED"].map((step, idx) => {
                const currentIdx = ["PENDING", "IN_TRANSIT", "COMPLETED"].indexOf(status);
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
              TRANSFER ORDER CANCELED
            </div>
          )}

          {selectedTransfer?.notes && (
            <div className="p-4 rounded-xl bg-[#141624] border border-[#23263b] text-xs text-gray-300 space-y-1">
              <span className="font-bold text-gray-400 block">Notes & Justification:</span>
              <p>{selectedTransfer.notes}</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
