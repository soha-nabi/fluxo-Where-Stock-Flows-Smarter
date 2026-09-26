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
  kpis: null,
  operationsSummary: null,
  warehouseMetrics: [],
  liveActivity: [],
  lowStockItems: [],
  healthScore: null,
  loading: false,
  error: null,
  lastFetched: null,

  fetchKPIs: async (params, forceRefresh = false) => {
    const { lastFetched, kpis } = get();
    if (!forceRefresh && lastFetched && Date.now() - lastFetched < CACHE_TTL_MS && kpis) {
      return kpis;
    }
    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[DashboardStore] Fetching KPIs with params:", params);
      }
      const data = await dashboardApi.getKPIs(params);
      set({ kpis: data });
      return data;
    } catch (err: any) {
      if (process.env.NODE_ENV === "development") {
        console.error("[DashboardStore] fetchKPIs Error:", err);
      }
      set({ error: err?.message || "Failed to fetch dashboard KPIs." });
    }
  },

  fetchOperationsSummary: async (params, forceRefresh = false) => {
    const { lastFetched, operationsSummary } = get();
    if (!forceRefresh && lastFetched && Date.now() - lastFetched < CACHE_TTL_MS && operationsSummary) {
      return operationsSummary;
    }
    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[DashboardStore] Fetching Operations Summary");
      }
      const data = await dashboardApi.getOperationsSummary(params);
      set({ operationsSummary: data });
      return data;
    } catch (err: any) {
      if (process.env.NODE_ENV === "development") {
        console.error("[DashboardStore] fetchOperationsSummary Error:", err);
      }
      set({ error: err?.message || "Failed to fetch operations summary." });
    }
  },

  fetchWarehouseMetrics: async (forceRefresh = false) => {
    const { lastFetched, warehouseMetrics } = get();
    if (!forceRefresh && lastFetched && Date.now() - lastFetched < CACHE_TTL_MS && warehouseMetrics.length > 0) {
      return warehouseMetrics;
    }
    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[DashboardStore] Fetching Warehouse Distribution");
      }
      const data = await dashboardApi.getWarehouseDistribution();
      set({ warehouseMetrics: data || [] });
      return data;
    } catch (err: any) {
      if (process.env.NODE_ENV === "development") {
        console.error("[DashboardStore] fetchWarehouseMetrics Error:", err);
      }
      set({ error: err?.message || "Failed to fetch warehouse metrics." });
    }
  },

  fetchLiveActivity: async (limit = 20) => {
    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[DashboardStore] Polling Live Activity (limit:", limit, ")");
      }
      const data = await dashboardApi.getLiveActivity(limit);
      set({ liveActivity: data || [] });
      return data;
    } catch (err: any) {
      if (process.env.NODE_ENV === "development") {
        console.error("[DashboardStore] fetchLiveActivity Error:", err);
      }
      set({ error: err?.message || "Failed to fetch live activity feed." });
    }
  },

  fetchLowStockItems: async (forceRefresh = false) => {
    const { lastFetched, lowStockItems } = get();
    if (!forceRefresh && lastFetched && Date.now() - lastFetched < CACHE_TTL_MS && lowStockItems.length > 0) {
      return lowStockItems;
    }
    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[DashboardStore] Fetching Low Stock Items");
      }
      const data = await dashboardApi.getLowStockItems();
      set({ lowStockItems: data || [] });
      return data;
    } catch (err: any) {
      if (process.env.NODE_ENV === "development") {
        console.error("[DashboardStore] fetchLowStockItems Error:", err);
      }
      set({ error: err?.message || "Failed to fetch low stock items." });
    }
  },

  fetchHealthScore: async (forceRefresh = false) => {
    const { lastFetched, healthScore } = get();
    if (!forceRefresh && lastFetched && Date.now() - lastFetched < CACHE_TTL_MS && healthScore) {
      return healthScore;
    }
    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[DashboardStore] Fetching Health Score");
      }
      const data = await dashboardApi.getHealthScore();
      set({ healthScore: data });
      return data;
    } catch (err: any) {
      if (process.env.NODE_ENV === "development") {
        console.error("[DashboardStore] fetchHealthScore Error:", err);
      }
      set({ error: err?.message || "Failed to fetch system health score." });
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
      set({ loading: false, error: err?.message || "Failed to complete dashboard data fetch." });
    }
  },

  subscribeToLiveActivity: (intervalMs = 15000) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[DashboardStore] Subscribing to live activity every ${intervalMs}ms`);
    }

    // Initial call immediately
    get().fetchLiveActivity();

    // Set interval for real-time polling updates
    const intervalId = setInterval(() => {
      get().fetchLiveActivity();
    }, intervalMs);

    // Return unsubscription teardown function
    return () => {
      if (process.env.NODE_ENV === "development") {
        console.log("[DashboardStore] Unsubscribing from live activity updates");
      }
      clearInterval(intervalId);
    };
  },

  clearError: () => set({ error: null }),
}));
