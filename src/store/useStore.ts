import { create } from "zustand";
import { Warehouse } from "@/lib/api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export type DateRange = "7d" | "30d" | "90d" | "all";

interface GlobalState {
  user: User | null;
  selectedWarehouse: Warehouse | null;
  dateRange: DateRange;
  
  // Actions
  setUser: (user: User | null) => void;
  setSelectedWarehouse: (warehouse: Warehouse | null) => void;
  setDateRange: (range: DateRange) => void;
  logout: () => void;
}

export const useStore = create<GlobalState>((set) => ({
  user: null,
  selectedWarehouse: null,
  dateRange: "30d",

  setUser: (user) => {
    if (process.env.NODE_ENV === "development") {
      console.log("[GlobalStore] Setting User:", user);
    }
    set({ user });
  },

  setSelectedWarehouse: (warehouse) => {
    if (process.env.NODE_ENV === "development") {
      console.log("[GlobalStore] Setting Selected Warehouse:", warehouse?.name || "All Warehouses");
    }
    set({ selectedWarehouse: warehouse });
  },

  setDateRange: (range) => {
    if (process.env.NODE_ENV === "development") {
      console.log("[GlobalStore] Setting Date Range:", range);
    }
    set({ dateRange: range });
  },

  logout: () => {
    if (process.env.NODE_ENV === "development") {
      console.log("[GlobalStore] Logging out user...");
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("fluxo_token");
      localStorage.removeItem("auth_token");
    }
    set({ user: null, selectedWarehouse: null });
  },
}));
