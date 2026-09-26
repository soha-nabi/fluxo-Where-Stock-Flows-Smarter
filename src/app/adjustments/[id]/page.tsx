"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useAdjustmentStore } from "@/store";
import {
  ArrowLeft,
  Sliders,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  XCircle,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function AdjustmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const {
    selectedAdjustment,
    fetchAdjustment,
    approveAdjustment,
    executeAdjustment,
    rejectAdjustment,
    loading,
    error,
    clearError,
  } = useAdjustmentStore();

  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchAdjustment(id);
  }, [id, fetchAdjustment]);

  const handleApprove = async () => {
    setActionLoading(true);
    await approveAdjustment(id);
    setActionLoading(false);
  };

  const handleExecute = async () => {
    setActionLoading(true);
    await executeAdjustment(id);
    setActionLoading(false);
  };

  const handleReject = async () => {
    if (confirm("Are you sure you want to reject this stock adjustment request?")) {
      setActionLoading(true);
      await rejectAdjustment(id);
      setActionLoading(false);
    }
  };

  if (loading && !selectedAdjustment) {
    return (
      <AppShell>
        <div className="p-12 text-center text-gray-400 text-xs flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
          <span>Loading stock adjustment audit details...</span>
        </div>
      </AppShell>
    );
  }

  if (!selectedAdjustment && !loading) {
    return (
      <AppShell>
        <div className="p-12 text-center text-gray-400 text-xs flex flex-col items-center gap-4">
          <AlertCircle className="w-10 h-10 text-amber-400" />
          <p className="text-sm font-bold text-white">Adjustment Audit Record Not Found</p>
          <Link href="/adjustments" className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold">
            Back to Adjustments
          </Link>
        </div>
      </AppShell>
    );
  }

  const status = selectedAdjustment?.status || "DRAFT";
  const isRejected = status === "REJECTED";

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <Link href="/adjustments" className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Back to Stock Adjustments
          </Link>

          <div className="flex items-center gap-3">
            {(status === "DRAFT" || status === "PENDING_APPROVAL") && (
              <>
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" /> Authorize & Approve
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-bold flex items-center gap-1"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </>
            )}

            {status === "APPROVED" && (
              <button
                onClick={handleExecute}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/40"
              >
                <Zap className="w-4 h-4" /> Execute & Post Stock Ledger
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

        {/* Audit Details Card */}
        <div className="bg-[#121422] border border-[#212438] p-6 rounded-2xl shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Sliders className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-3">
                  Adjustment: {selectedAdjustment?.adjustment_number}
                  <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-800/50">
                    Status: {status}
                  </span>
                </h1>
                <p className="text-xs text-gray-400 mt-1">
                  Product SKU: <strong className="text-purple-300 font-mono">{selectedAdjustment?.product_name || selectedAdjustment?.product_id}</strong> | Reason: <strong className="text-amber-400 font-mono">{selectedAdjustment?.reason}</strong>
                </p>
              </div>
            </div>

            <div className="text-left md:text-right text-xs font-mono text-gray-400 space-y-1">
              <div>Created At: {new Date(selectedAdjustment?.created_at || "").toLocaleString()}</div>
              <div>Auditor: {selectedAdjustment?.created_by}</div>
            </div>
          </div>

          {/* Variance Telemetry Card */}
          <div className="p-5 rounded-xl bg-[#16182a] border border-[#242742] grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Quantity Before</span>
              <span className="font-mono text-xl font-bold text-gray-300 block">{selectedAdjustment?.quantity_before}</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Physical Count After</span>
              <span className="font-mono text-xl font-bold text-white block">{selectedAdjustment?.quantity_after}</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Recorded Variance</span>
              <span className={`font-mono text-xl font-bold block ${
                (selectedAdjustment?.quantity_diff || 0) >= 0 ? "text-emerald-400" : "text-amber-400"
              }`}>
                {(selectedAdjustment?.quantity_diff || 0) > 0
                  ? `+${selectedAdjustment?.quantity_diff}`
                  : selectedAdjustment?.quantity_diff}
              </span>
            </div>
          </div>

          {/* Workflow Timeline */}
          {!isRejected ? (
            <div className="grid grid-cols-4 gap-2 pt-4 border-t border-[#20233b]">
              {["DRAFT", "PENDING_APPROVAL", "APPROVED", "EXECUTED"].map((step, idx) => {
                const currentIdx = ["DRAFT", "PENDING_APPROVAL", "APPROVED", "EXECUTED"].indexOf(status);
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
              ADJUSTMENT REQUEST REJECTED
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
