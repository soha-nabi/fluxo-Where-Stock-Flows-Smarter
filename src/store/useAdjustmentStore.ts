import { create } from "zustand";
import { adjustmentsApi, Adjustment, AdjustmentInput } from "@/lib/api";

const CACHE_TTL_MS = 5 * 60 * 1000;

interface AdjustmentState {
  adjustments: Adjustment[];
  selectedAdjustment: Adjustment | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;

  // Actions
  fetchAdjustments: (
    filters?: { status?: string; reason?: string; date_range?: string },
    forceRefresh?: boolean
  ) => Promise<Adjustment[] | void>;
  fetchAdjustment: (id: string) => Promise<Adjustment | void>;
  createAdjustment: (data: AdjustmentInput) => Promise<Adjustment | void>;
  approveAdjustment: (id: string) => Promise<Adjustment | void>;
  executeAdjustment: (id: string) => Promise<Adjustment | void>;
  rejectAdjustment: (id: string) => Promise<Adjustment | void>;
  setSelectedAdjustment: (adjustment: Adjustment | null) => void;
  clearError: () => void;
}

export const useAdjustmentStore = create<AdjustmentState>((set, get) => ({
  adjustments: [],
  selectedAdjustment: null,
  loading: false,
  error: null,
  lastFetched: null,

  fetchAdjustments: async (filters, forceRefresh = false) => {
    const { lastFetched, adjustments } = get();
    const now = Date.now();

    if (!forceRefresh && lastFetched && now - lastFetched < CACHE_TTL_MS && adjustments.length > 0 && !filters?.status) {
      if (process.env.NODE_ENV === "development") {
        console.log("[AdjustmentStore] Returning cached adjustments");
      }
      return adjustments;
    }

    set({ loading: true, error: null });
    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[AdjustmentStore] Fetching adjustments with filters:", filters);
      }
      const data = await adjustmentsApi.getAdjustments(filters);
      set({ adjustments: data || [], loading: false, lastFetched: now });
      return data;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to fetch stock adjustments.";
      if (process.env.NODE_ENV === "development") {
        console.error("[AdjustmentStore] fetchAdjustments Error:", err);
      }
      set({ error: errorMessage, loading: false });
    }
  },

  fetchAdjustment: async (id: string) => {
    set({ loading: true, error: null });
    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[AdjustmentStore] Fetching adjustment detail for ID:", id);
      }
      const data = await adjustmentsApi.getAdjustment(id);
      set({ selectedAdjustment: data, loading: false });
      return data;
    } catch (err: any) {
      const errorMessage = err?.message || `Failed to fetch adjustment ${id}.`;
      if (process.env.NODE_ENV === "development") {
        console.error("[AdjustmentStore] fetchAdjustment Error:", err);
      }
      set({ error: errorMessage, loading: false });
    }
  },

  createAdjustment: async (data: AdjustmentInput) => {
    const previousAdjustments = get().adjustments;
    const tempId = `temp-${Date.now()}`;
    const tempAdjustment: Adjustment = {
      id: tempId,
      adjustment_number: `ADJ-${Math.floor(1000 + Math.random() * 9000)}`,
      product_id: data.product_id,
      warehouse_id: data.warehouse_id,
      location_id: data.location_id,
      quantity_before: 0,
      quantity_after: data.physical_count,
      quantity_diff: data.physical_count,
      reason: data.reason,
      status: "DRAFT",
      created_by: "Current User",
      created_at: new Date().toISOString(),
    };

    // Optimistic UI Update
    set({ adjustments: [tempAdjustment, ...previousAdjustments], error: null });

    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[AdjustmentStore] Optimistically creating adjustment:", data);
      }
      const createdAdjustment = await adjustmentsApi.createAdjustment(data);
      set((state) => ({
        adjustments: state.adjustments.map((a) => (a.id === tempId ? createdAdjustment : a)),
      }));
      return createdAdjustment;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to create adjustment.";
      if (process.env.NODE_ENV === "development") {
        console.error("[AdjustmentStore] createAdjustment Error. Rolling back state.", err);
      }
      set({ adjustments: previousAdjustments, error: errorMessage });
    }
  },

  approveAdjustment: async (id: string) => {
    const previousAdjustments = get().adjustments;
    const previousSelected = get().selectedAdjustment;

    // Optimistic status update to APPROVED
    set((state) => ({
      adjustments: state.adjustments.map((a) => (a.id === id ? { ...a, status: "APPROVED" } : a)),
      selectedAdjustment: state.selectedAdjustment?.id === id ? { ...state.selectedAdjustment, status: "APPROVED" } : state.selectedAdjustment,
      error: null,
    }));

    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[AdjustmentStore] Optimistically approving adjustment:", id);
      }
      const updatedAdjustment = await adjustmentsApi.approveAdjustment(id);
      set((state) => ({
        adjustments: state.adjustments.map((a) => (a.id === id ? updatedAdjustment : a)),
        selectedAdjustment: state.selectedAdjustment?.id === id ? updatedAdjustment : state.selectedAdjustment,
      }));
      return updatedAdjustment;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to approve adjustment.";
      if (process.env.NODE_ENV === "development") {
        console.error("[AdjustmentStore] approveAdjustment Error. Rolling back state.", err);
      }
      set({ adjustments: previousAdjustments, selectedAdjustment: previousSelected, error: errorMessage });
    }
  },

  executeAdjustment: async (id: string) => {
    const previousAdjustments = get().adjustments;
    const previousSelected = get().selectedAdjustment;

    // Optimistic status update to EXECUTED
    set((state) => ({
      adjustments: state.adjustments.map((a) => (a.id === id ? { ...a, status: "EXECUTED" } : a)),
      selectedAdjustment: state.selectedAdjustment?.id === id ? { ...state.selectedAdjustment, status: "EXECUTED" } : state.selectedAdjustment,
      error: null,
    }));

    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[AdjustmentStore] Optimistically executing adjustment:", id);
      }
      const updatedAdjustment = await adjustmentsApi.executeAdjustment(id);
      set((state) => ({
        adjustments: state.adjustments.map((a) => (a.id === id ? updatedAdjustment : a)),
        selectedAdjustment: state.selectedAdjustment?.id === id ? updatedAdjustment : state.selectedAdjustment,
      }));
      return updatedAdjustment;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to execute stock adjustment.";
      if (process.env.NODE_ENV === "development") {
        console.error("[AdjustmentStore] executeAdjustment Error. Rolling back state.", err);
      }
      set({ adjustments: previousAdjustments, selectedAdjustment: previousSelected, error: errorMessage });
    }
  },

  rejectAdjustment: async (id: string) => {
    const previousAdjustments = get().adjustments;
    const previousSelected = get().selectedAdjustment;

    // Optimistic status update to REJECTED
    set((state) => ({
      adjustments: state.adjustments.map((a) => (a.id === id ? { ...a, status: "REJECTED" } : a)),
      selectedAdjustment: state.selectedAdjustment?.id === id ? { ...state.selectedAdjustment, status: "REJECTED" } : state.selectedAdjustment,
      error: null,
    }));

    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[AdjustmentStore] Optimistically rejecting adjustment:", id);
      }
      const updatedAdjustment = await adjustmentsApi.rejectAdjustment(id);
      set((state) => ({
        adjustments: state.adjustments.map((a) => (a.id === id ? updatedAdjustment : a)),
        selectedAdjustment: state.selectedAdjustment?.id === id ? updatedAdjustment : state.selectedAdjustment,
      }));
      return updatedAdjustment;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to reject adjustment.";
      if (process.env.NODE_ENV === "development") {
        console.error("[AdjustmentStore] rejectAdjustment Error. Rolling back state.", err);
      }
      set({ adjustments: previousAdjustments, selectedAdjustment: previousSelected, error: errorMessage });
    }
  },

  setSelectedAdjustment: (adjustment) => set({ selectedAdjustment: adjustment }),
  clearError: () => set({ error: null }),
}));
