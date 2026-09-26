"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useReceiptStore } from "@/store";
import { warehousesApi, Warehouse } from "@/lib/api";
import {
  ArrowDownLeft,
  Plus,
  Filter,
  RefreshCw,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  FileText,
  Boxes,
} from "lucide-react";

export default function ReceiptsPage() {
  const { receipts, loading, error, fetchReceipts, clearError } = useReceiptStore();

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [warehouseFilter, setWarehouseFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    fetchReceipts();
    warehousesApi.getWarehouses().then((res) => setWarehouses(res || [])).catch(() => {});
  }, [fetchReceipts]);

  const filteredReceipts = receipts.filter((r) => {
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    const matchesWarehouse = warehouseFilter === "ALL" || r.warehouse_id === warehouseFilter;
    const matchesSearch =
      r.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.supplier_name && r.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesWarehouse && matchesSearch;
  });

  const recentReceipts = [...filteredReceipts].slice(0, 10);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 text-[10px] font-bold inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case "VALIDATED":
        return (
          <span className="px-2.5 py-1 rounded-full bg-purple-950/70 border border-purple-800/60 text-purple-300 text-[10px] font-bold inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Validated
          </span>
        );
      case "RECEIVED":
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-950/70 border border-blue-800/60 text-blue-300 text-[10px] font-bold inline-flex items-center gap-1">
            <Boxes className="w-3 h-3" /> Received
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
              <ArrowDownLeft className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-3">
                Goods Receipts & Inbound Logistics
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/50">
                  {filteredReceipts.length} Orders
                </span>
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Track incoming supplier purchase orders, inspection validation, and stock put-away.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchReceipts(undefined, true)}
              disabled={loading}
              className="px-3.5 py-2.5 rounded-xl bg-[#1c1f33] hover:bg-[#282c47] text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-2 border border-[#2d314f]"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-purple-400" : ""}`} />
              <span>Refresh</span>
            </button>

            <Link
              href="/receipts/new"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-900/30"
            >
              <Plus className="w-4 h-4" />
              <span>Create Receipt</span>
            </Link>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={clearError} className="underline text-red-400">
              Dismiss
            </button>
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search Order # or Supplier..."
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
              <option value="RECEIVED">RECEIVED</option>
              <option value="VALIDATED">VALIDATED</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>

          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141624] border border-[#23263b] text-xs text-white focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
            >
              <option value="ALL">All Destination Warehouses</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Receipts Table */}
        <div className="bg-[#121422] border border-[#212438] rounded-2xl overflow-hidden shadow-xl">
          {loading && receipts.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-xs flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
              <span>Fetching goods receipts orders...</span>
            </div>
          ) : recentReceipts.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-xs flex flex-col items-center gap-3">
              <FileText className="w-10 h-10 text-gray-600" />
              <span>No receipts match your search filters.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#17192b] border-b border-[#23263b] text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Receipt #</th>
                    <th className="py-3.5 px-4">Supplier</th>
                    <th className="py-3.5 px-4">Destination Warehouse</th>
                    <th className="py-3.5 px-4">Items Count</th>
                    <th className="py-3.5 px-4">Expected Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2136] text-xs">
                  {recentReceipts.map((receipt) => (
                    <tr key={receipt.id} className="hover:bg-[#181a2e] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        <Link href={`/receipts/${receipt.id}`} className="hover:text-purple-400">
                          {receipt.receipt_number}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-gray-300">
                        {receipt.supplier_name || receipt.supplier_id || "Standard Supplier"}
                      </td>
                      <td className="py-3.5 px-4 text-gray-300">
                        {receipt.warehouse_name || receipt.warehouse_id || "Main Warehouse"}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-purple-300 font-bold">
                        {receipt.total_items || (receipt.items ? receipt.items.length : 0)} SKUs
                      </td>
                      <td className="py-3.5 px-4 text-gray-400 font-mono">
                        {new Date(receipt.expected_date).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(receipt.status)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/receipts/${receipt.id}`}
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
