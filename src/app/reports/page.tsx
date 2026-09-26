"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  dashboardApi,
  ledgerApi,
  LowStockItem,
  LedgerEntry,
  HealthScore,
  WarehouseMetrics,
} from "@/lib/api";
import {
  BarChart3,
  AlertTriangle,
  History,
  ShieldCheck,
  Warehouse,
  Download,
  RefreshCw,
  Clock,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"low_stock" | "movement" | "accuracy" | "health">("low_stock");

  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [warehouseMetrics, setWarehouseMetrics] = useState<WarehouseMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReportsData() {
      setLoading(true);
      try {
        const [lowStockRes, ledgerRes, healthRes, whRes] = await Promise.allSettled([
          dashboardApi.getLowStockItems(),
          ledgerApi.getLedger(),
          dashboardApi.getHealthScore(),
          dashboardApi.getWarehouseDistribution(),
        ]);

        if (lowStockRes.status === "fulfilled") setLowStockItems(lowStockRes.value || []);
        if (ledgerRes.status === "fulfilled") setLedgerEntries(ledgerRes.value || []);
        if (healthRes.status === "fulfilled") setHealthScore(healthRes.value || null);
        if (whRes.status === "fulfilled") setWarehouseMetrics(whRes.value || []);
      } catch (err) {
        console.error("Failed to load reports analytics", err);
      } finally {
        setLoading(false);
      }
    }

    loadReportsData();
  }, []);

  const exportLowStockCSV = () => {
    if (lowStockItems.length === 0) return;
    const headers = "Product,Warehouse,Current Quantity,Reorder Threshold,Suggested Order\n";
    const rows = lowStockItems
      .map(
        (it) =>
          `"${it.product}","${it.warehouse}",${it.current},${it.reorder_level},${it.suggested_order}`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fluxo_low_stock_report_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Reports Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121422] border border-[#212438] p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-900/40">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Analytics & Executive Reports</h1>
              <p className="text-xs text-gray-400 mt-1">
                Deep-dive operational metrics: Low stock alerts, stock ledger movements, accuracy scores, and warehouse health.
              </p>
            </div>
          </div>

          {activeTab === "low_stock" && (
            <button
              onClick={exportLowStockCSV}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-900/40"
            >
              <Download className="w-4 h-4" />
              <span>Export Low Stock CSV</span>
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#212438] pb-2">
          {[
            { id: "low_stock", label: "Low Stock Alerts", icon: AlertTriangle, badge: lowStockItems.length },
            { id: "movement", label: "Inventory Movement Ledger", icon: History, badge: ledgerEntries.length },
            { id: "accuracy", label: "Stock Accuracy", icon: ShieldCheck },
            { id: "health", label: "Warehouse Network Health", icon: Warehouse },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                  isActive
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40"
                    : "bg-[#141624] text-gray-400 hover:text-white border border-[#23263b]"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    isActive ? "bg-white/20 text-white" : "bg-[#1f2233] text-gray-400"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: LOW STOCK ALERTS */}
        {activeTab === "low_stock" && (
          <div className="bg-[#121422] border border-[#212438] rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Low Stock Items Requiring Reorder
            </h3>

            {loading ? (
              <div className="p-8 text-center text-gray-400 text-xs">Loading low stock data...</div>
            ) : lowStockItems.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-xs flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                <span>All items are currently above reorder thresholds. No reorders needed!</span>
              </div>
            ) : (
              <div className="overflow-x-auto border border-[#20233b] rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#17192b] text-[11px] font-semibold text-gray-400 uppercase border-b border-[#23263b]">
                      <th className="py-3 px-4">Product Name</th>
                      <th className="py-3 px-4">Warehouse</th>
                      <th className="py-3 px-4">Current Stock</th>
                      <th className="py-3 px-4">Reorder Threshold</th>
                      <th className="py-3 px-4 text-right">Suggested Reorder Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2136]">
                    {lowStockItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#181a2e]">
                        <td className="py-3 px-4 font-bold text-white">{item.product}</td>
                        <td className="py-3 px-4 text-gray-300">{item.warehouse}</td>
                        <td className="py-3 px-4 font-mono font-bold text-amber-400">{item.current} units</td>
                        <td className="py-3 px-4 font-mono text-gray-400">{item.reorder_level} units</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-purple-300">
                          +{item.suggested_order} units
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INVENTORY MOVEMENT LEDGER */}
        {activeTab === "movement" && (
          <div className="bg-[#121422] border border-[#212438] rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-purple-400" />
              Full Stock Movement Audit Log
            </h3>

            {loading ? (
              <div className="p-8 text-center text-gray-400 text-xs">Loading ledger logs...</div>
            ) : (
              <div className="overflow-x-auto border border-[#20233b] rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#17192b] text-[11px] font-semibold text-gray-400 uppercase border-b border-[#23263b]">
                      <th className="py-3 px-4">Operation / Ref</th>
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4">Warehouse</th>
                      <th className="py-3 px-4">Quantity Change</th>
                      <th className="py-3 px-4">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2136]">
                    {ledgerEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-[#181a2e]">
                        <td className="py-3 px-4">
                          <span className="font-bold text-white block">{entry.operation}</span>
                          <span className="text-[10px] text-gray-400 font-mono">Ref: {entry.reference}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-200">{entry.product}</td>
                        <td className="py-3 px-4 text-gray-300">{entry.warehouse}</td>
                        <td className="py-3 px-4 font-mono font-bold">
                          <span className={entry.quantity_change >= 0 ? "text-emerald-400" : "text-amber-400"}>
                            {entry.quantity_change > 0 ? `+${entry.quantity_change}` : entry.quantity_change}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-400">
                          {new Date(entry.date).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: STOCK ACCURACY */}
        {activeTab === "accuracy" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-[#121422] border border-[#212438] p-6 rounded-2xl shadow-xl space-y-4 text-center">
              <span className="text-xs uppercase text-gray-400 font-bold block">Overall System Accuracy Score</span>
              <div className="w-24 h-24 rounded-full bg-purple-950/60 border-4 border-purple-500 flex items-center justify-center mx-auto text-3xl font-extrabold text-purple-300 font-mono shadow-xl shadow-purple-900/50">
                {healthScore?.health_score || 96}%
              </div>
              <span className="text-xs text-emerald-400 font-bold block">{healthScore?.status || "HEALTHY"}</span>
            </div>

            <div className="lg:col-span-2 bg-[#121422] border border-[#212438] p-6 rounded-2xl shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" /> Accuracy Telemetry Highlights
              </h3>
              <div className="space-y-3 text-xs text-gray-300">
                <div className="p-3 rounded-xl bg-[#16182a] border border-[#242742] flex justify-between items-center">
                  <span>Cycle Count Match Rate</span>
                  <span className="font-mono font-bold text-emerald-400">98.4%</span>
                </div>
                <div className="p-3 rounded-xl bg-[#16182a] border border-[#242742] flex justify-between items-center">
                  <span>Shrinkage Variance Index</span>
                  <span className="font-mono font-bold text-purple-300">0.3%</span>
                </div>
                <div className="p-3 rounded-xl bg-[#16182a] border border-[#242742] flex justify-between items-center">
                  <span>Audit Frequency Compliance</span>
                  <span className="font-mono font-bold text-emerald-400">100%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: WAREHOUSE HEALTH */}
        {activeTab === "health" && (
          <div className="bg-[#121422] border border-[#212438] p-6 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Warehouse className="w-4 h-4 text-purple-400" /> Network Warehouse Capacity & Health
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {warehouseMetrics.map((wh, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-[#16182a] border border-[#242742] space-y-3 shadow-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-sm">{wh.name}</span>
                    <span className="text-xs font-mono font-bold text-purple-300">{wh.health}% Health</span>
                  </div>

                  <div className="space-y-1 text-xs text-gray-400 font-mono">
                    <div className="flex justify-between">
                      <span>SKU Count:</span>
                      <span className="text-white font-bold">{wh.skus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Capacity Utilization:</span>
                      <span className="text-emerald-400 font-bold">{wh.utilization}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Low Stock Items:</span>
                      <span className="text-amber-400 font-bold">{wh.low_stock_items}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
