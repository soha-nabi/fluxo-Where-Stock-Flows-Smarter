"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useTransferStore } from "@/store";
import { warehousesApi, Warehouse } from "@/lib/api";
import {
  Repeat,
  Plus,
  Filter,
  RefreshCw,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  ArrowRight,
  Truck,
  XCircle,
} from "lucide-react";

export default function TransfersPage() {
  const { transfers, loading, error, fetchTransfers, clearError } = useTransferStore();

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    fetchTransfers();
    warehousesApi.getWarehouses().then((res) => setWarehouses(res || [])).catch(() => {});
  }, [fetchTransfers]);

  const filteredTransfers = transfers.filter((t) => {
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    const matchesSearch =
      t.transfer_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.product_id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 text-[10px] font-bold inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case "IN_TRANSIT":
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-950/70 border border-blue-800/60 text-blue-300 text-[10px] font-bold inline-flex items-center gap-1">
            <Truck className="w-3 h-3" /> In Transit
          </span>
        );
      case "CANCELED":
        return (
          <span className="px-2.5 py-1 rounded-full bg-red-950/70 border border-red-800/60 text-red-300 text-[10px] font-bold inline-flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Canceled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-950/70 border border-amber-800/60 text-amber-300 text-[10px] font-bold inline-flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pending Approval
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
              <Repeat className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-3">
                Inter-Warehouse Stock Transfers
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/50">
                  {filteredTransfers.length} Transfers
                </span>
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Relocate inventory items between nodes with dual-warehouse audit approval.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchTransfers(undefined, true)}
              disabled={loading}
              className="px-3.5 py-2.5 rounded-xl bg-[#1c1f33] hover:bg-[#282c47] text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-2 border border-[#2d314f]"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-purple-400" : ""}`} />
              <span>Refresh</span>
            </button>

            <Link
              href="/transfers/new"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-900/30"
            >
              <Plus className="w-4 h-4" />
              <span>Create Transfer Order</span>
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

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search Transfer # or Product ID..."
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
              <option value="PENDING">PENDING</option>
              <option value="IN_TRANSIT">IN_TRANSIT</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELED">CANCELED</option>
            </select>
          </div>
        </div>

        {/* Transfers Table */}
        <div className="bg-[#121422] border border-[#212438] rounded-2xl overflow-hidden shadow-xl">
          {loading && transfers.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-xs flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
              <span>Fetching transfer orders...</span>
            </div>
          ) : filteredTransfers.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-xs flex flex-col items-center gap-3">
              <Repeat className="w-10 h-10 text-gray-600" />
              <span>No transfer orders found matching filters.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#17192b] border-b border-[#23263b] text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Transfer #</th>
                    <th className="py-3.5 px-4">Product ID</th>
                    <th className="py-3.5 px-4">Route Path (From → To)</th>
                    <th className="py-3.5 px-4">Quantity</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2136] text-xs">
                  {filteredTransfers.map((trf) => (
                    <tr key={trf.id} className="hover:bg-[#181a2e] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        <Link href={`/transfers/${trf.id}`} className="hover:text-purple-400">
                          {trf.transfer_number}
                        </Link>
                      </td>

                      <td className="py-3.5 px-4 text-gray-300 font-bold">
                        {trf.product_name || trf.product_id}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="px-2 py-0.5 rounded bg-[#16182a] border border-[#262945] font-semibold text-gray-200">
                            {trf.from_warehouse_name || trf.from_warehouse_id}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span className="px-2 py-0.5 rounded bg-[#16182a] border border-[#262945] font-semibold text-gray-200">
                            {trf.to_warehouse_name || trf.to_warehouse_id}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-purple-300">
                        {trf.quantity} units
                      </td>

                      <td className="py-3.5 px-4">{getStatusBadge(trf.status)}</td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/transfers/${trf.id}`}
                          className="px-3 py-1.5 rounded-lg bg-[#1c1f33] hover:bg-purple-600 text-gray-300 hover:text-white transition-all text-xs font-semibold inline-flex items-center gap-1.5 border border-[#2c304f]"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
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
