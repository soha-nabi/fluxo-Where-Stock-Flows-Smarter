"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAdjustmentStore } from "@/store";
import {
  Sliders,
  Plus,
  Filter,
  RefreshCw,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  ShieldCheck,
} from "lucide-react";

export default function AdjustmentsPage() {
  const { adjustments, loading, error, fetchAdjustments, clearError } = useAdjustmentStore();

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [reasonFilter, setReasonFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    fetchAdjustments();
  }, [fetchAdjustments]);

  const filteredAdjustments = adjustments.filter((a) => {
    const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;
    const matchesReason = reasonFilter === "ALL" || a.reason === reasonFilter;
    const matchesSearch =
      a.adjustment_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.product_id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesReason && matchesSearch;
  });

  const pendingApprovals = adjustments.filter((a) => a.status === "PENDING_APPROVAL" || a.status === "DRAFT");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "EXECUTED":
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 text-[10px] font-bold inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Executed & Updated
          </span>
        );
      case "APPROVED":
        return (
          <span className="px-2.5 py-1 rounded-full bg-purple-950/70 border border-purple-800/60 text-purple-300 text-[10px] font-bold inline-flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-2.5 py-1 rounded-full bg-red-950/70 border border-red-800/60 text-red-300 text-[10px] font-bold inline-flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      case "PENDING_APPROVAL":
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-950/70 border border-amber-800/60 text-amber-300 text-[10px] font-bold inline-flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pending Approval
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-gray-800/80 border border-gray-700 text-gray-300 text-[10px] font-bold inline-flex items-center gap-1">
            <Clock className="w-3 h-3" /> Draft
          </span>
        );
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121422] border border-[#212438] p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-900/40">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-3">
                Stock Reconciliation & Adjustments
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/50">
                  {filteredAdjustments.length} Adjustments
                </span>
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Audit physical counts, record reason codes (damage/spoilage/loss), and execute inventory adjustments.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchAdjustments(undefined, true)}
              disabled={loading}
              className="px-3.5 py-2.5 rounded-xl bg-[#1c1f33] hover:bg-[#282c47] text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-2 border border-[#2d314f]"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-purple-400" : ""}`} />
              <span>Refresh</span>
            </button>

            <Link
              href="/adjustments/new"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-900/30"
            >
              <Plus className="w-4 h-4" />
              <span>Create Adjustment</span>
            </Link>
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

        {/* Approval Queue Highlight Banner */}
        {pendingApprovals.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/40 flex items-center justify-between text-amber-200 text-xs shadow-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                <strong>{pendingApprovals.length} Adjustments Pending Approval:</strong> Audit physical count discrepancies require manager authorization before ledger execution.
              </span>
            </div>
            <button
              onClick={() => setStatusFilter("PENDING_APPROVAL")}
              className="px-3 py-1.5 rounded-xl bg-amber-900/80 hover:bg-amber-800 text-amber-100 font-bold border border-amber-700/60"
            >
              View Queue
            </button>
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search Adjustment # or Product ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141624] border border-[#23263b] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141624] border border-[#23263b] text-xs text-white focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">DRAFT</option>
              <option value="PENDING_APPROVAL">PENDING APPROVAL</option>
              <option value="APPROVED">APPROVED</option>
              <option value="EXECUTED">EXECUTED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>

          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
            <select
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141624] border border-[#23263b] text-xs text-white focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
            >
              <option value="ALL">All Reason Codes</option>
              <option value="DAMAGED">DAMAGED</option>
              <option value="LOST">LOST</option>
              <option value="MISCOUNT">MISCOUNT</option>
              <option value="RECOUNT">RECOUNT</option>
              <option value="THEFT">THEFT</option>
              <option value="EXPIRATION">EXPIRATION</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>
        </div>

        {/* Adjustments Table */}
        <div className="bg-[#121422] border border-[#212438] rounded-2xl overflow-hidden shadow-xl">
          {loading && adjustments.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-xs flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
              <span>Fetching physical count adjustment orders...</span>
            </div>
          ) : filteredAdjustments.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-xs flex flex-col items-center gap-3">
              <Sliders className="w-10 h-10 text-gray-600" />
              <span>No stock adjustment records match your filters.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#17192b] border-b border-[#23263b] text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Adjustment #</th>
                    <th className="py-3.5 px-4">Product ID</th>
                    <th className="py-3.5 px-4">System → Physical Count</th>
                    <th className="py-3.5 px-4">Variance Diff</th>
                    <th className="py-3.5 px-4">Reason Code</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2136] text-xs">
                  {filteredAdjustments.map((adj) => (
                    <tr key={adj.id} className="hover:bg-[#181a2e] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        <Link href={`/adjustments/${adj.id}`} className="hover:text-purple-400">
                          {adj.adjustment_number}
                        </Link>
                      </td>

                      <td className="py-3.5 px-4 text-gray-300 font-bold">
                        {adj.product_name || adj.product_id}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-gray-300">
                        {adj.quantity_before} → <strong className="text-white">{adj.quantity_after}</strong>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span className={adj.quantity_diff >= 0 ? "text-emerald-400" : "text-amber-400"}>
                          {adj.quantity_diff > 0 ? `+${adj.quantity_diff}` : adj.quantity_diff}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-[#1a1d30] text-gray-300 border border-[#2b2f4c] text-[10px] font-mono font-bold">
                          {adj.reason}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">{getStatusBadge(adj.status)}</td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/adjustments/${adj.id}`}
                          className="px-3 py-1.5 rounded-lg bg-[#1c1f33] hover:bg-purple-600 text-gray-300 hover:text-white transition-all text-xs font-semibold inline-flex items-center gap-1.5 border border-[#2c304f]"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Audit</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
