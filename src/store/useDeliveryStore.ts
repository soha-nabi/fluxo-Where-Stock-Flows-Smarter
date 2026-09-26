import { create } from "zustand";
import { deliveriesApi, Delivery, DeliveryInput } from "@/lib/api";

const CACHE_TTL_MS = 5 * 60 * 1000;

interface DeliveryState {
  deliveries: Delivery[];
  selectedDelivery: Delivery | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;

  // Actions
  fetchDeliveries: (
    filters?: { warehouse_id?: string; status?: string; date_range?: string },
    forceRefresh?: boolean
  ) => Promise<Delivery[] | void>;
  fetchDelivery: (id: string) => Promise<Delivery | void>;
  createDelivery: (data: DeliveryInput) => Promise<Delivery | void>;
  pickItems: (
    deliveryId: string,
    items: { delivery_item_id: string; quantity_picked: number }[]
  ) => Promise<Delivery | void>;
  packItems: (
    deliveryId: string,
    items: { delivery_item_id: string; quantity_packed: number }[]
  ) => Promise<Delivery | void>;
  shipDelivery: (id: string) => Promise<Delivery | void>;
  cancelDelivery: (id: string) => Promise<Delivery | void>;
  setSelectedDelivery: (delivery: Delivery | null) => void;
  clearError: () => void;
}

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  deliveries: [],
  selectedDelivery: null,
  loading: false,
  error: null,
  lastFetched: null,

  fetchDeliveries: async (filters, forceRefresh = false) => {
    const { lastFetched, deliveries } = get();
    const now = Date.now();

    if (!forceRefresh && lastFetched && now - lastFetched < CACHE_TTL_MS && deliveries.length > 0 && !filters?.status) {
      if (process.env.NODE_ENV === "development") {
        console.log("[DeliveryStore] Returning cached deliveries");
      }
      return deliveries;
    }

    set({ loading: true, error: null });
    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[DeliveryStore] Fetching deliveries with filters:", filters);
      }
      const raw = await deliveriesApi.getDeliveries(filters);
      const list = Array.isArray(raw) ? raw : (raw as any)?.data || [];
      set({ deliveries: list, loading: false, lastFetched: now });
      return list;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to fetch deliveries.";
      if (process.env.NODE_ENV === "development") {
        console.error("[DeliveryStore] fetchDeliveries Error:", err);
      }
      set({ deliveries: get().deliveries || [], error: errorMessage, loading: false });
    }
  },

  fetchDelivery: async (id: string) => {
    set({ loading: true, error: null });
    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[DeliveryStore] Fetching delivery detail for ID:", id);
      }
      const data = await deliveriesApi.getDelivery(id);
      set({ selectedDelivery: data, loading: false });
      return data;
    } catch (err: any) {
      const errorMessage = err?.message || `Failed to fetch delivery ${id}.`;
      if (process.env.NODE_ENV === "development") {
        console.error("[DeliveryStore] fetchDelivery Error:", err);
      }
      set({ error: errorMessage, loading: false });
    }
  },

  createDelivery: async (data: DeliveryInput) => {
    const previousDeliveries = get().deliveries;
    const tempId = `temp-${Date.now()}`;
    const tempDelivery: Delivery = {
      id: tempId,
      delivery_number: `DEL-${Math.floor(1000 + Math.random() * 9000)}`,
      customer_id: data.customer_id,
      warehouse_id: data.warehouse_id,
      status: "DRAFT",
      order_date: new Date().toISOString(),
      planned_delivery_date: new Date(Date.now() + 86400000 * 2).toISOString(),
      notes: data.notes,
      created_by: "Current User",
      created_at: new Date().toISOString(),
      items: data.items.map((it, idx) => ({
        id: `del-item-${idx}`,
        product_id: it.product_id,
        quantity_ordered: it.quantity_ordered,
        quantity_picked: 0,
        quantity_packed: 0,
        quantity_shipped: 0,
      })),
    };

    // Optimistic UI Update
    set({ deliveries: [tempDelivery, ...previousDeliveries], error: null });

    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[DeliveryStore] Optimistically creating delivery:", data);
      }
      const createdDelivery = await deliveriesApi.createDelivery(data);
      set((state) => ({
        deliveries: state.deliveries.map((d) => (d.id === tempId ? createdDelivery : d)),
      }));
      return createdDelivery;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to create delivery.";
      if (process.env.NODE_ENV === "development") {
        console.error("[DeliveryStore] createDelivery Error. Rolling back state.", err);
      }
      set({ deliveries: previousDeliveries, error: errorMessage });
    }
  },

  pickItems: async (deliveryId: string, items: { delivery_item_id: string; quantity_picked: number }[]) => {
    const previousDeliveries = get().deliveries;
    const previousSelected = get().selectedDelivery;

    // Optimistic status update to PICKING / PICKED
    set((state) => ({
      deliveries: state.deliveries.map((d) => (d.id === deliveryId ? { ...d, status: "PICKED" } : d)),
      selectedDelivery: state.selectedDelivery?.id === deliveryId ? { ...state.selectedDelivery, status: "PICKED" } : state.selectedDelivery,
      error: null,
    }));

    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[DeliveryStore] Picking items for delivery:", deliveryId);
      }
      const updatedDelivery = await deliveriesApi.pickItems(deliveryId, items);
      set((state) => ({
        deliveries: state.deliveries.map((d) => (d.id === deliveryId ? updatedDelivery : d)),
        selectedDelivery: state.selectedDelivery?.id === deliveryId ? updatedDelivery : state.selectedDelivery,
      }));
      return updatedDelivery;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to pick delivery items.";
      if (process.env.NODE_ENV === "development") {
        console.error("[DeliveryStore] pickItems Error. Rolling back state.", err);
      }
      set({ deliveries: previousDeliveries, selectedDelivery: previousSelected, error: errorMessage });
    }
  },

  packItems: async (deliveryId: string, items: { delivery_item_id: string; quantity_packed: number }[]) => {
    const previousDeliveries = get().deliveries;
    const previousSelected = get().selectedDelivery;

    // Optimistic status update to PACKED
    set((state) => ({
      deliveries: state.deliveries.map((d) => (d.id === deliveryId ? { ...d, status: "PACKED" } : d)),
      selectedDelivery: state.selectedDelivery?.id === deliveryId ? { ...state.selectedDelivery, status: "PACKED" } : state.selectedDelivery,
      error: null,
    }));

    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[DeliveryStore] Packing items for delivery:", deliveryId);
      }
      const updatedDelivery = await deliveriesApi.packItems(deliveryId, items);
      set((state) => ({
        deliveries: state.deliveries.map((d) => (d.id === deliveryId ? updatedDelivery : d)),
        selectedDelivery: state.selectedDelivery?.id === deliveryId ? updatedDelivery : state.selectedDelivery,
      }));
      return updatedDelivery;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to pack delivery items.";
      if (process.env.NODE_ENV === "development") {
        console.error("[DeliveryStore] packItems Error. Rolling back state.", err);
      }
      set({ deliveries: previousDeliveries, selectedDelivery: previousSelected, error: errorMessage });
    }
  },

  shipDelivery: async (id: string) => {
    const previousDeliveries = get().deliveries;
    const previousSelected = get().selectedDelivery;

    // Optimistic status update to SHIPPED
    set((state) => ({
      deliveries: state.deliveries.map((d) => (d.id === id ? { ...d, status: "SHIPPED" } : d)),
      selectedDelivery: state.selectedDelivery?.id === id ? { ...state.selectedDelivery, status: "SHIPPED" } : state.selectedDelivery,
      error: null,
    }));

    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[DeliveryStore] Optimistically shipping delivery:", id);
      }
      const updatedDelivery = await deliveriesApi.shipDelivery(id);
      set((state) => ({
        deliveries: state.deliveries.map((d) => (d.id === id ? updatedDelivery : d)),
        selectedDelivery: state.selectedDelivery?.id === id ? updatedDelivery : state.selectedDelivery,
      }));
      return updatedDelivery;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to ship delivery.";
      if (process.env.NODE_ENV === "development") {
        console.error("[DeliveryStore] shipDelivery Error. Rolling back state.", err);
      }
      set({ deliveries: previousDeliveries, selectedDelivery: previousSelected, error: errorMessage });
    }
  },

  cancelDelivery: async (id: string) => {
    const previousDeliveries = get().deliveries;
    const previousSelected = get().selectedDelivery;

    // Optimistic status update to CANCELED
    set((state) => ({
      deliveries: state.deliveries.map((d) => (d.id === id ? { ...d, status: "CANCELED" } : d)),
      selectedDelivery: state.selectedDelivery?.id === id ? { ...state.selectedDelivery, status: "CANCELED" } : state.selectedDelivery,
      error: null,
    }));

    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[DeliveryStore] Optimistically canceling delivery:", id);
      }
      const updatedDelivery = await deliveriesApi.cancelDelivery(id);
      set((state) => ({
        deliveries: state.deliveries.map((d) => (d.id === id ? updatedDelivery : d)),
        selectedDelivery: state.selectedDelivery?.id === id ? updatedDelivery : state.selectedDelivery,
      }));
      return updatedDelivery;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to cancel delivery.";
      if (process.env.NODE_ENV === "development") {
        console.error("[DeliveryStore] cancelDelivery Error. Rolling back state.", err);
      }
      set({ deliveries: previousDeliveries, selectedDelivery: previousSelected, error: errorMessage });
    }
  },

  setSelectedDelivery: (delivery) => set({ selectedDelivery: delivery }),
  clearError: () => set({ error: null }),
}));
