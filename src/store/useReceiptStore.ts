import { create } from "zustand";
import { receiptsApi, Receipt, ReceiptInput, ReceiptItemInput } from "@/lib/api";

const CACHE_TTL_MS = 5 * 60 * 1000;

interface ReceiptState {
  receipts: Receipt[];
  selectedReceipt: Receipt | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;

  // Actions
  fetchReceipts: (
    filters?: { warehouse_id?: string; status?: string; date_range?: string },
    forceRefresh?: boolean
  ) => Promise<Receipt[] | void>;
  fetchReceipt: (id: string) => Promise<Receipt | void>;
  createReceipt: (data: ReceiptInput) => Promise<Receipt | void>;
  addItems: (receiptId: string, items: ReceiptItemInput[]) => Promise<Receipt | void>;
  receiveItems: (
    receiptId: string,
    items: { receipt_item_id: string; quantity_received: number }[]
  ) => Promise<Receipt | void>;
  validateReceipt: (id: string) => Promise<Receipt | void>;
  completeReceipt: (id: string) => Promise<Receipt | void>;
  deleteReceipt: (id: string) => Promise<void>;
  updateReceipt: (id: string, data: Partial<ReceiptInput>) => Promise<Receipt | void>;
  setSelectedReceipt: (receipt: Receipt | null) => void;
  clearError: () => void;
}

export const useReceiptStore = create<ReceiptState>((set, get) => ({
  receipts: [],
  selectedReceipt: null,
  loading: false,
  error: null,
  lastFetched: null,

  fetchReceipts: async (filters, forceRefresh = false) => {
    const { lastFetched, receipts } = get();
    const now = Date.now();

    if (!forceRefresh && lastFetched && now - lastFetched < CACHE_TTL_MS && receipts.length > 0 && !filters?.status) {
      if (process.env.NODE_ENV === "development") {
        console.log("[ReceiptStore] Returning cached receipts");
      }
      return receipts;
    }

    set({ loading: true, error: null });
    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[ReceiptStore] Fetching receipts with filters:", filters);
      }
      const raw = await receiptsApi.getReceipts(filters);
      const list = Array.isArray(raw) ? raw : (raw as any)?.data || [];
      set({ receipts: list, loading: false, lastFetched: now });
      return list;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to fetch receipts.";
      if (process.env.NODE_ENV === "development") {
        console.error("[ReceiptStore] fetchReceipts Error:", err);
      }
      set({ receipts: get().receipts || [], error: errorMessage, loading: false });
    }
  },

  fetchReceipt: async (id: string) => {
    set({ loading: true, error: null });
    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[ReceiptStore] Fetching receipt details for ID:", id);
      }
      const data = await receiptsApi.getReceipt(id);
      set({ selectedReceipt: data, loading: false });
      return data;
    } catch (err: any) {
      const errorMessage = err?.message || `Failed to fetch receipt ${id}.`;
      if (process.env.NODE_ENV === "development") {
        console.error("[ReceiptStore] fetchReceipt Error:", err);
      }
      set({ error: errorMessage, loading: false });
    }
  },

  createReceipt: async (data: ReceiptInput) => {
    const previousReceipts = get().receipts;
    const tempId = `temp-${Date.now()}`;
    const tempReceipt: Receipt = {
      id: tempId,
      receipt_number: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
      supplier_id: data.supplier_id,
      warehouse_id: data.warehouse_id,
      status: "DRAFT",
      expected_date: new Date().toISOString(),
      total_items: data.items.length,
      notes: data.notes,
      created_by: "Current User",
      created_at: new Date().toISOString(),
      items: data.items.map((it, idx) => ({
        id: `item-${idx}`,
        product_id: it.product_id,
        quantity_expected: it.quantity_expected,
        unit_price: it.unit_price,
      })),
    };

    // Optimistic UI Update
    set({ receipts: [tempReceipt, ...previousReceipts], error: null });

    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[ReceiptStore] Optimistically creating receipt:", data);
      }
      const createdReceipt = await receiptsApi.createReceipt(data);
      set((state) => ({
        receipts: state.receipts.map((r) => (r.id === tempId ? createdReceipt : r)),
      }));
      return createdReceipt;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to create receipt.";
      if (process.env.NODE_ENV === "development") {
        console.error("[ReceiptStore] createReceipt Error. Rolling back state.", err);
      }
      set({ receipts: previousReceipts, error: errorMessage });
    }
  },

  addItems: async (receiptId: string, items: ReceiptItemInput[]) => {
    const previousReceipts = get().receipts;
    const previousSelected = get().selectedReceipt;

    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[ReceiptStore] Adding items to receipt:", receiptId);
      }
      const updatedReceipt = await receiptsApi.addReceiptItems(receiptId, items);
      set((state) => ({
        receipts: state.receipts.map((r) => (r.id === receiptId ? updatedReceipt : r)),
        selectedReceipt: state.selectedReceipt?.id === receiptId ? updatedReceipt : state.selectedReceipt,
      }));
      return updatedReceipt;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to add items to receipt.";
      if (process.env.NODE_ENV === "development") {
        console.error("[ReceiptStore] addItems Error:", err);
      }
      set({ receipts: previousReceipts, selectedReceipt: previousSelected, error: errorMessage });
    }
  },

  receiveItems: async (receiptId: string, items: { receipt_item_id: string; quantity_received: number }[]) => {
    const previousReceipts = get().receipts;
    const previousSelected = get().selectedReceipt;

    // Optimistic status update to RECEIVED
    set((state) => ({
      receipts: state.receipts.map((r) => (r.id === receiptId ? { ...r, status: "RECEIVED" } : r)),
      selectedReceipt: state.selectedReceipt?.id === receiptId ? { ...state.selectedReceipt, status: "RECEIVED" } : state.selectedReceipt,
      error: null,
    }));

    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[ReceiptStore] Receiving items for receipt:", receiptId);
      }
      const updatedReceipt = await receiptsApi.receiveItems(receiptId, items);
      set((state) => ({
        receipts: state.receipts.map((r) => (r.id === receiptId ? updatedReceipt : r)),
        selectedReceipt: state.selectedReceipt?.id === receiptId ? updatedReceipt : state.selectedReceipt,
      }));
      return updatedReceipt;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to process item reception.";
      if (process.env.NODE_ENV === "development") {
        console.error("[ReceiptStore] receiveItems Error. Rolling back state.", err);
      }
      set({ receipts: previousReceipts, selectedReceipt: previousSelected, error: errorMessage });
    }
  },

  validateReceipt: async (id: string) => {
    const previousReceipts = get().receipts;
    const previousSelected = get().selectedReceipt;

    // Optimistic Update
    set((state) => ({
      receipts: state.receipts.map((r) => (r.id === id ? { ...r, status: "VALIDATED" } : r)),
      selectedReceipt: state.selectedReceipt?.id === id ? { ...state.selectedReceipt, status: "VALIDATED" } : state.selectedReceipt,
      error: null,
    }));

    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[ReceiptStore] Optimistically validating receipt:", id);
      }
      const updatedReceipt = await receiptsApi.validateReceipt(id);
      set((state) => ({
        receipts: state.receipts.map((r) => (r.id === id ? updatedReceipt : r)),
        selectedReceipt: state.selectedReceipt?.id === id ? updatedReceipt : state.selectedReceipt,
      }));
      return updatedReceipt;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to validate receipt.";
      if (process.env.NODE_ENV === "development") {
        console.error("[ReceiptStore] validateReceipt Error. Rolling back state.", err);
      }
      set({ receipts: previousReceipts, selectedReceipt: previousSelected, error: errorMessage });
    }
  },

  completeReceipt: async (id: string) => {
    const previousReceipts = get().receipts;
    const previousSelected = get().selectedReceipt;

    // Optimistic Update
    set((state) => ({
      receipts: state.receipts.map((r) => (r.id === id ? { ...r, status: "COMPLETED" } : r)),
      selectedReceipt: state.selectedReceipt?.id === id ? { ...state.selectedReceipt, status: "COMPLETED" } : state.selectedReceipt,
      error: null,
    }));

    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[ReceiptStore] Optimistically completing receipt:", id);
      }
      const updatedReceipt = await receiptsApi.completeReceipt(id);
      set((state) => ({
        receipts: state.receipts.map((r) => (r.id === id ? updatedReceipt : r)),
        selectedReceipt: state.selectedReceipt?.id === id ? updatedReceipt : state.selectedReceipt,
      }));
      return updatedReceipt;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to complete receipt.";
      if (process.env.NODE_ENV === "development") {
        console.error("[ReceiptStore] completeReceipt Error. Rolling back state.", err);
      }
      set({ receipts: previousReceipts, selectedReceipt: previousSelected, error: errorMessage });
    }
  },

  deleteReceipt: async (id: string) => {
    const previousReceipts = get().receipts;
    const previousSelected = get().selectedReceipt;

    set((state) => ({
      receipts: state.receipts.filter((r) => r.id !== id),
      selectedReceipt: state.selectedReceipt?.id === id ? null : state.selectedReceipt,
      error: null,
    }));

    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[ReceiptStore] Optimistically deleting receipt:", id);
      }
      await receiptsApi.deleteReceipt(id);
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to delete receipt.";
      if (process.env.NODE_ENV === "development") {
        console.error("[ReceiptStore] deleteReceipt Error. Rolling back state.", err);
      }
      set({ receipts: previousReceipts, selectedReceipt: previousSelected, error: errorMessage });
    }
  },

  updateReceipt: async (id: string, data: Partial<ReceiptInput>) => {
    const previousReceipts = get().receipts;
    const previousSelected = get().selectedReceipt;

    const { items, ...scalarData } = data;

    set((state) => ({
      receipts: state.receipts.map((r) => (r.id === id ? { ...r, ...scalarData } : r)),
      selectedReceipt: state.selectedReceipt?.id === id ? { ...state.selectedReceipt, ...scalarData } : state.selectedReceipt,
      error: null,
    }));

    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[ReceiptStore] Updating receipt draft:", id);
      }
      // Note: Backend might re-fetch or update receipt
      const updatedReceipt = await receiptsApi.getReceipt(id);
      set((state) => ({
        receipts: state.receipts.map((r) => (r.id === id ? updatedReceipt : r)),
        selectedReceipt: state.selectedReceipt?.id === id ? updatedReceipt : state.selectedReceipt,
      }));
      return updatedReceipt;
    } catch (err: any) {
      set({ receipts: previousReceipts, selectedReceipt: previousSelected, error: err?.message || "Failed to update receipt." });
    }
  },

  setSelectedReceipt: (receipt) => set({ selectedReceipt: receipt }),
  clearError: () => set({ error: null }),
}));
