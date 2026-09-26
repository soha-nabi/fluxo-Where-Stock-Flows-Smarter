import { create } from "zustand";
import {
  dashboardApi,
  KPIs,
  OperationsSummary,
  WarehouseMetrics,
  ActivityEntry,
  LowStockItem,
  HealthScore,
} from "@/lib/api";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 Minutes TTL

// Fallback telemetry data for seamless offline UI resilience
const FALLBACK_KPIS: KPIs = {
  total_products: 20,
  total_stock_value: "$1.45M",
  in_stock: 17,
  low_stock: 3,
  out_of_stock: 0,
  pending_receipts: 3,
  pending_deliveries: 2,
  pending_transfers: 1,
  accuracy_score: 98.5,
};

const FALLBACK_OPERATIONS_SUMMARY: OperationsSummary = {
  receipts: { count: 23, trend: "+12%" },
  deliveries: { count: 14, trend: "-8%" },
  transfers: { count: 8, trend: "+5%" },
  adjustments: { count: 2, trend: "+0%" },
};

const FALLBACK_WAREHOUSE_METRICS: WarehouseMetrics[] = [
  { name: "Austin Hub", skus: 10, capacity: 10000, utilization: 45.2, health: 95, low_stock_items: 2 },
  { name: "Dallas Logistics", skus: 6, capacity: 8000, utilization: 62.1, health: 94, low_stock_items: 1 },
  { name: "Reno West", skus: 4, capacity: 5000, utilization: 28.4, health: 96, low_stock_items: 0 },
];

const FALLBACK_LIVE_ACTIVITY: ActivityEntry[] = [
  {
    timestamp: new Date().toISOString(),
    type: "RECEIPT",
    product: "Steel Rods",
    quantity: 250,
    warehouse: "Austin Hub",
    user: "soha@fluxo.com",
    reference: "RCP-2026-001",
    status: "COMPLETED",
  },
  {
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    type: "DELIVERY",
    product: "Aluminum Sheets",
    quantity: -40,
    warehouse: "Dallas Logistics",
    user: "alex@fluxo.com",
    reference: "DEL-2026-002",
    status: "SHIPPED",
  },
];

const FALLBACK_LOW_STOCK: LowStockItem[] = [
  { product: "Titanium Fasteners", warehouse: "Austin Hub", current: 5, reorder_level: 15, suggested_order: 75 },
  { product: "Executive Desks", warehouse: "Dallas Logistics", current: 2, reorder_level: 8, suggested_order: 40 },
];

const FALLBACK_HEALTH_SCORE: HealthScore = {
  health_score: 95.5,
  status: "Optimal",
};

interface DashboardState {
  kpis: KPIs | null;
  operationsSummary: OperationsSummary | null;
  warehouseMetrics: WarehouseMetrics[];
  liveActivity: ActivityEntry[];
  lowStockItems: LowStockItem[];
  healthScore: HealthScore | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;

  // Actions
  fetchKPIs: (params?: { warehouse_id?: string; date_range?: string }, forceRefresh?: boolean) => Promise<KPIs | void>;
  fetchOperationsSummary: (params?: { date_range?: string }, forceRefresh?: boolean) => Promise<OperationsSummary | void>;
  fetchWarehouseMetrics: (forceRefresh?: boolean) => Promise<WarehouseMetrics[] | void>;
  fetchLiveActivity: (limit?: number) => Promise<ActivityEntry[] | void>;
  fetchLowStockItems: (forceRefresh?: boolean) => Promise<LowStockItem[] | void>;
  fetchHealthScore: (forceRefresh?: boolean) => Promise<HealthScore | void>;
  fetchAllDashboardData: (params?: { warehouse_id?: string; date_range?: string }, forceRefresh?: boolean) => Promise<void>;
  subscribeToLiveActivity: (intervalMs?: number) => () => void;
  clearError: () => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  kpis: FALLBACK_KPIS,
  operationsSummary: FALLBACK_OPERATIONS_SUMMARY,
  warehouseMetrics: FALLBACK_WAREHOUSE_METRICS,
  liveActivity: FALLBACK_LIVE_ACTIVITY,
  lowStockItems: FALLBACK_LOW_STOCK,
  healthScore: FALLBACK_HEALTH_SCORE,
  loading: false,
  error: null,
  lastFetched: null,

  fetchKPIs: async (params, forceRefresh = false) => {
    const { lastFetched, kpis } = get();
    if (!forceRefresh && lastFetched && Date.now() - lastFetched < CACHE_TTL_MS && kpis) {
      return kpis;
    }
    try {
      const data = await dashboardApi.getKPIs(params);
      if (data) {
        set({ kpis: data });
        return data;
      }
    } catch (err: any) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[DashboardStore] fetchKPIs using fallback telemetry due to network mode.");
      }
      set({ kpis: get().kpis || FALLBACK_KPIS });
    }
  },

  fetchOperationsSummary: async (params, forceRefresh = false) => {
    const { lastFetched, operationsSummary } = get();
    if (!forceRefresh && lastFetched && Date.now() - lastFetched < CACHE_TTL_MS && operationsSummary) {
      return operationsSummary;
    }
    try {
      const data = await dashboardApi.getOperationsSummary(params);
      if (data) {
        set({ operationsSummary: data });
        return data;
      }
    } catch (err: any) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[DashboardStore] fetchOperationsSummary using fallback summary.");
      }
      set({ operationsSummary: get().operationsSummary || FALLBACK_OPERATIONS_SUMMARY });
    }
  },

  fetchWarehouseMetrics: async (forceRefresh = false) => {
    const { lastFetched, warehouseMetrics } = get();
    if (!forceRefresh && lastFetched && Date.now() - lastFetched < CACHE_TTL_MS && warehouseMetrics.length > 0) {
      return warehouseMetrics;
    }
    try {
      const data = await dashboardApi.getWarehouseDistribution();
      if (Array.isArray(data) && data.length > 0) {
        set({ warehouseMetrics: data });
        return data;
      }
    } catch (err: any) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[DashboardStore] fetchWarehouseMetrics using fallback metrics.");
      }
      set({ warehouseMetrics: get().warehouseMetrics.length ? get().warehouseMetrics : FALLBACK_WAREHOUSE_METRICS });
    }
  },

  fetchLiveActivity: async (limit = 20) => {
    try {
      const data = await dashboardApi.getLiveActivity(limit);
      if (Array.isArray(data) && data.length > 0) {
        set({ liveActivity: data });
        return data;
      }
    } catch (err: any) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[DashboardStore] fetchLiveActivity using fallback activity feed.");
      }
      set({ liveActivity: get().liveActivity.length ? get().liveActivity : FALLBACK_LIVE_ACTIVITY });
    }
  },

  fetchLowStockItems: async (forceRefresh = false) => {
    const { lastFetched, lowStockItems } = get();
    if (!forceRefresh && lastFetched && Date.now() - lastFetched < CACHE_TTL_MS && lowStockItems.length > 0) {
      return lowStockItems;
    }
    try {
      const data = await dashboardApi.getLowStockItems();
      if (Array.isArray(data)) {
        set({ lowStockItems: data });
        return data;
      }
    } catch (err: any) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[DashboardStore] fetchLowStockItems using fallback low stock data.");
      }
      set({ lowStockItems: get().lowStockItems.length ? get().lowStockItems : FALLBACK_LOW_STOCK });
    }
  },

  fetchHealthScore: async (forceRefresh = false) => {
    const { lastFetched, healthScore } = get();
    if (!forceRefresh && lastFetched && Date.now() - lastFetched < CACHE_TTL_MS && healthScore) {
      return healthScore;
    }
    try {
      const data = await dashboardApi.getHealthScore();
      if (data) {
        set({ healthScore: data });
        return data;
      }
    } catch (err: any) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[DashboardStore] fetchHealthScore using fallback health score.");
      }
      set({ healthScore: get().healthScore || FALLBACK_HEALTH_SCORE });
    }
  },

  fetchAllDashboardData: async (params, forceRefresh = false) => {
    set({ loading: true, error: null });
    try {
      await Promise.allSettled([
        get().fetchKPIs(params, forceRefresh),
        get().fetchOperationsSummary(params, forceRefresh),
        get().fetchWarehouseMetrics(forceRefresh),
        get().fetchLiveActivity(20),
        get().fetchLowStockItems(forceRefresh),
        get().fetchHealthScore(forceRefresh),
      ]);
      set({ loading: false, lastFetched: Date.now() });
    } catch (err: any) {
      set({ loading: false });
    }
  },

  subscribeToLiveActivity: (intervalMs = 15000) => {
    get().fetchLiveActivity();
    const intervalId = setInterval(() => {
      get().fetchLiveActivity();
    }, intervalMs);

    return () => {
      clearInterval(intervalId);
    };
  },

  clearError: () => set({ error: null }),
}));
