"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useDashboardStore, useStore } from "@/store";
import { OperationsOverviewHero } from "@/components/dashboard/OperationsOverviewHero";
import { InventoryHealthSection } from "@/components/dashboard/InventoryHealthSection";
import { StockMovementChart } from "@/components/dashboard/StockMovementChart";
import { LiveActivityFeed } from "@/components/dashboard/LiveActivityFeed";
import { LiveMovementLogTable } from "@/components/dashboard/LiveMovementLogTable";
import { RefreshCw, AlertCircle, Warehouse as WarehouseIcon, Activity } from "lucide-react";

export default function MissionControlDashboard() {
  const { selectedWarehouse, dateRange } = useStore();
  const {
    kpis,
    operationsSummary,
    warehouseMetrics,
    liveActivity,
    lowStockItems,
    healthScore,
    loading,
    error,
    fetchAllDashboardData,
    subscribeToLiveActivity,
    clearError,
  } = useDashboardStore();

  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-refresh every 30 seconds & initial fetch
  useEffect(() => {
    const params = {
      warehouse_id: selectedWarehouse?.id,
      date_range: dateRange,
    };

    fetchAllDashboardData(params, true);
    setLastUpdated(new Date());

    const timer = setInterval(() => {
      fetchAllDashboardData(params, true);
      setLastUpdated(new Date());
    }, 30000);

    const unsubscribe = subscribeToLiveActivity(15000);

    return () => {
      clearInterval(timer);
      unsubscribe();
    };
  }, [selectedWarehouse, dateRange, fetchAllDashboardData, subscribeToLiveActivity]);

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Dashboard Status & Control Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#121422] border border-[#212438] p-4 rounded-2xl shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white flex items-center gap-2">
                Mission Control Telemetry
                {selectedWarehouse && (
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/50">
                    <WarehouseIcon className="w-3 h-3 inline mr-1" />
                    {selectedWarehouse.name}
                  </span>
                )}
              </h1>
              <p className="text-xs text-gray-400">
                Real-time inventory flows across all network nodes & warehouses.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-[11px] text-gray-500 font-mono" suppressHydrationWarning>
              Updated: {mounted ? lastUpdated.toLocaleTimeString() : "--:--:--"}
            </span>
            <button
              onClick={() => {
                fetchAllDashboardData({ warehouse_id: selectedWarehouse?.id, date_range: dateRange }, true);
                setLastUpdated(new Date());
              }}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl bg-[#1c1f33] hover:bg-[#282c47] text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-2 border border-[#2d314f] transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-purple-400" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Error Boundary Notice */}
        {error && (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs shadow-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-xs text-red-400 hover:text-red-200 underline font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Hero & Operations Overview */}
        <OperationsOverviewHero />

        {/* Telemetry 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InventoryHealthSection />
          <StockMovementChart />
          <LiveActivityFeed />
        </div>

        {/* Live Movement Log Table */}
        <LiveMovementLogTable />
      </div>
    </AppShell>
  );
}
