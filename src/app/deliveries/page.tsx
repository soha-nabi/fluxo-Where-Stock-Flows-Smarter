"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useDeliveryStore } from "@/store";
import { warehousesApi, Warehouse } from "@/lib/api";
import {
  ArrowUpRight,
  Plus,
  Filter,
  RefreshCw,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  Box,
  Layers,
  FileText,
} from "lucide-react";

export default function DeliveriesPage() {
  const { deliveries, loading, error, fetchDeliveries, clearError } = useDeliveryStore();

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [warehouseFilter, setWarehouseFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    fetchDeliveries();
    warehousesApi.getWarehouses().then((res) => setWarehouses(res || [])).catch(() => {});
  }, [fetchDeliveries]);

  const filteredDeliveries = deliveries.filter((d) => {
    const matchesStatus = statusFilter === "ALL" || d.status === statusFilter;
    const matchesWarehouse = warehouseFilter === "ALL" || d.warehouse_id === warehouseFilter;
    const matchesSearch =
      d.delivery_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.customer_id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesWarehouse && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
      case "SHIPPED":
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 text-[10px] font-bold inline-flex items-center gap-1">
            <Truck className="w-3 h-3" /> {status}
          </span>
        );
      case "PACKED":
        return (
          <span className="px-2.5 py-1 rounded-full bg-indigo-950/70 border border-indigo-800/60 text-indigo-300 text-[10px] font-bold inline-flex items-center gap-1">
            <Box className="w-3 h-3" /> Packed
          </span>
        );
      case "PICKED":
      case "PICKING":
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-950/70 border border-amber-800/60 text-amber-300 text-[10px] font-bold inline-flex items-center gap-1">
            <Layers className="w-3 h-3" /> Picking/Picked
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
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-3">
                Customer Outbound Deliveries
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/50">
                  {filteredDeliveries.length} Shipments
                </span>
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Manage order fulfillment pipeline: Picking → Packing → Shipping → Customer Delivery.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchDeliveries(undefined, true)}
              disabled={loading}
              className="px-3.5 py-2.5 rounded-xl bg-[#1c1f33] hover:bg-[#282c47] text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-2 border border-[#2d314f]"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-purple-400" : ""}`} />
              <span>Refresh</span>
            </button>

            <Link
              href="/deliveries/new"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-900/30"
            >
              <Plus className="w-4 h-4" />
              <span>Create Delivery Order</span>
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

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search Delivery # or Customer..."
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
              <option value="PICKING">PICKING / PICKED</option>
              <option value="PACKED">PACKED</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
            </select>
          </div>

          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141624] border border-[#23263b] text-xs text-white focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
            >
              <option value="ALL">All Source Warehouses</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Deliveries Pipeline Columns / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {["DRAFT", "PICKED", "PACKED", "SHIPPED"].map((stage) => {
            const stageDeliveries = filteredDeliveries.filter((d) => {
              if (stage === "PICKED") return d.status === "PICKING" || d.status === "PICKED";
              if (stage === "SHIPPED") return d.status === "SHIPPED" || d.status === "DELIVERED";
              return d.status === stage;
            });

            return (
              <div key={stage} className="bg-[#121422] border border-[#212438] rounded-2xl p-4 space-y-3 shadow-lg">
                <div className="flex items-center justify-between border-b border-[#20233b] pb-2.5">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    {stage}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#181a2e] text-purple-300 border border-[#292d47]">
                    {stageDeliveries.length}
                  </span>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {stageDeliveries.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-[11px] italic">No orders in this stage.</div>
                  ) : (
                    stageDeliveries.map((del) => (
                      <div
                        key={del.id}
                        className="p-3.5 rounded-xl bg-[#16182a] border border-[#242742] hover:border-purple-500/50 transition-all space-y-2 group shadow"
                      >
                        <div className="flex items-center justify-between">
                          <Link href={`/deliveries/${del.id}`} className="font-mono font-bold text-xs text-white hover:text-purple-400">
                            {del.delivery_number}
                          </Link>
                          {getStatusBadge(del.status)}
                        </div>

                        <div className="text-[11px] text-gray-400 space-y-0.5">
                          <div>Customer: <strong className="text-gray-200">{del.customer_id}</strong></div>
                          <div>Warehouse: <strong className="text-gray-200">{del.warehouse_name || del.warehouse_id}</strong></div>
                        </div>

                        <div className="pt-2 border-t border-[#20233b] flex items-center justify-between text-[10px]">
                          <span className="text-gray-500 font-mono">
                            {new Date(del.planned_delivery_date).toLocaleDateString()}
                          </span>
                          <Link href={`/deliveries/${del.id}`} className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1">
                            Process <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
