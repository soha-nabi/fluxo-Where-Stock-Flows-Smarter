import { create } from "zustand";
import { transfersApi, Transfer, TransferInput } from "@/lib/api";

const CACHE_TTL_MS = 5 * 60 * 1000;

interface TransferState {
  transfers: Transfer[];
  selectedTransfer: Transfer | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;

  // Actions
  fetchTransfers: (
    filters?: { status?: string; date_range?: string },
    forceRefresh?: boolean
  ) => Promise<Transfer[] | void>;
  fetchTransfer: (id: string) => Promise<Transfer | void>;
  createTransfer: (data: TransferInput) => Promise<Transfer | void>;
  approveTransfer: (id: string) => Promise<Transfer | void>;
  completeTransfer: (id: string) => Promise<Transfer | void>;
  cancelTransfer: (id: string) => Promise<Transfer | void>;
  setSelectedTransfer: (transfer: Transfer | null) => void;
  clearError: () => void;
}

export const useTransferStore = create<TransferState>((set, get) => ({
  transfers: [],
  selectedTransfer: null,
  loading: false,
  error: null,
  lastFetched: null,

  fetchTransfers: async (filters, forceRefresh = false) => {
    const { lastFetched, transfers } = get();
    const now = Date.now();

    if (!forceRefresh && lastFetched && now - lastFetched < CACHE_TTL_MS && transfers.length > 0 && !filters?.status) {
      if (process.env.NODE_ENV === "development") {
        console.log("[TransferStore] Returning cached transfers");
      }
      return transfers;
    }

    set({ loading: true, error: null });
    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[TransferStore] Fetching transfers with filters:", filters);
      }
      const data = await transfersApi.getTransfers(filters);
      set({ transfers: data || [], loading: false, lastFetched: now });
      return data;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to fetch transfers.";
      if (process.env.NODE_ENV === "development") {
        console.error("[TransferStore] fetchTransfers Error:", err);
      }
      set({ error: errorMessage, loading: false });
    }
  },

  fetchTransfer: async (id: string) => {
    set({ loading: true, error: null });
    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[TransferStore] Fetching transfer details for ID:", id);
      }
      const data = await transfersApi.getTransfer(id);
      set({ selectedTransfer: data, loading: false });
      return data;
    } catch (err: any) {
      const errorMessage = err?.message || `Failed to fetch transfer ${id}.`;
      if (process.env.NODE_ENV === "development") {
        console.error("[TransferStore] fetchTransfer Error:", err);
      }
      set({ error: errorMessage, loading: false });
    }
  },

  createTransfer: async (data: TransferInput) => {
    const previousTransfers = get().transfers;
    const tempId = `temp-${Date.now()}`;
    const tempTransfer: Transfer = {
      id: tempId,
      transfer_number: `TRF-${Math.floor(1000 + Math.random() * 9000)}`,
      product_id: data.product_id,
      from_warehouse_id: data.from_warehouse_id,
      to_warehouse_id: data.to_warehouse_id,
      quantity: data.quantity,
      status: "PENDING",
      initiated_date: new Date().toISOString(),
      created_by: "Current User",
      notes: data.notes,
    };

    // Optimistic UI Update
    set({ transfers: [tempTransfer, ...previousTransfers], error: null });

    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[TransferStore] Optimistically creating transfer:", data);
      }
      const createdTransfer = await transfersApi.createTransfer(data);
      set((state) => ({
        transfers: state.transfers.map((t) => (t.id === tempId ? createdTransfer : t)),
      }));
      return createdTransfer;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to create internal transfer.";
      if (process.env.NODE_ENV === "development") {
        console.error("[TransferStore] createTransfer Error. Rolling back state.", err);
      }
      set({ transfers: previousTransfers, error: errorMessage });
    }
  },

  approveTransfer: async (id: string) => {
    const previousTransfers = get().transfers;
    const previousSelected = get().selectedTransfer;

    // Optimistic status update to IN_TRANSIT
    set((state) => ({
      transfers: state.transfers.map((t) => (t.id === id ? { ...t, status: "IN_TRANSIT" } : t)),
      selectedTransfer: state.selectedTransfer?.id === id ? { ...state.selectedTransfer, status: "IN_TRANSIT" } : state.selectedTransfer,
      error: null,
    }));

    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[TransferStore] Optimistically approving transfer:", id);
      }
      const updatedTransfer = await transfersApi.approveTransfer(id);
      set((state) => ({
        transfers: state.transfers.map((t) => (t.id === id ? updatedTransfer : t)),
        selectedTransfer: state.selectedTransfer?.id === id ? updatedTransfer : state.selectedTransfer,
      }));
      return updatedTransfer;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to approve transfer.";
      if (process.env.NODE_ENV === "development") {
        console.error("[TransferStore] approveTransfer Error. Rolling back state.", err);
      }
      set({ transfers: previousTransfers, selectedTransfer: previousSelected, error: errorMessage });
    }
  },

  completeTransfer: async (id: string) => {
    const previousTransfers = get().transfers;
    const previousSelected = get().selectedTransfer;

    // Optimistic status update to COMPLETED
    set((state) => ({
      transfers: state.transfers.map((t) => (t.id === id ? { ...t, status: "COMPLETED" } : t)),
      selectedTransfer: state.selectedTransfer?.id === id ? { ...state.selectedTransfer, status: "COMPLETED" } : state.selectedTransfer,
      error: null,
    }));

    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[TransferStore] Optimistically completing transfer:", id);
      }
      const updatedTransfer = await transfersApi.completeTransfer(id);
      set((state) => ({
        transfers: state.transfers.map((t) => (t.id === id ? updatedTransfer : t)),
        selectedTransfer: state.selectedTransfer?.id === id ? updatedTransfer : state.selectedTransfer,
      }));
      return updatedTransfer;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to complete transfer.";
      if (process.env.NODE_ENV === "development") {
        console.error("[TransferStore] completeTransfer Error. Rolling back state.", err);
      }
      set({ transfers: previousTransfers, selectedTransfer: previousSelected, error: errorMessage });
    }
  },

  cancelTransfer: async (id: string) => {
    const previousTransfers = get().transfers;
    const previousSelected = get().selectedTransfer;

    // Optimistic status update to CANCELED
    set((state) => ({
      transfers: state.transfers.map((t) => (t.id === id ? { ...t, status: "CANCELED" } : t)),
      selectedTransfer: state.selectedTransfer?.id === id ? { ...state.selectedTransfer, status: "CANCELED" } : state.selectedTransfer,
      error: null,
    }));

    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[TransferStore] Optimistically canceling transfer:", id);
      }
      const updatedTransfer = await transfersApi.cancelTransfer(id);
      set((state) => ({
        transfers: state.transfers.map((t) => (t.id === id ? updatedTransfer : t)),
        selectedTransfer: state.selectedTransfer?.id === id ? updatedTransfer : state.selectedTransfer,
      }));
      return updatedTransfer;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to cancel transfer.";
      if (process.env.NODE_ENV === "development") {
        console.error("[TransferStore] cancelTransfer Error. Rolling back state.", err);
      }
      set({ transfers: previousTransfers, selectedTransfer: previousSelected, error: errorMessage });
    }
  },

  setSelectedTransfer: (transfer) => set({ selectedTransfer: transfer }),
  clearError: () => set({ error: null }),
}));
