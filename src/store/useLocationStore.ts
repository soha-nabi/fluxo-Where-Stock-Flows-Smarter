import { create } from "zustand";
import { locationsApi, LocationItem, LocationDetail, LocationInput } from "@/lib/api";

interface LocationState {
  locations: LocationItem[];
  selectedLocation: LocationDetail | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;

  // Actions
  fetchLocations: (warehouseId: string, page?: number, limit?: number, forceRefresh?: boolean) => Promise<LocationItem[] | void>;
  fetchLocation: (id: string) => Promise<LocationDetail | void>;
  createLocation: (warehouseId: string, data: LocationInput) => Promise<LocationItem | void>;
  updateLocation: (id: string, data: Partial<LocationInput> & { is_active?: boolean }) => Promise<LocationItem | void>;
  deleteLocation: (id: string) => Promise<void>;
  setSelectedLocation: (location: LocationDetail | null) => void;
  clearError: () => void;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  locations: [],
  selectedLocation: null,
  loading: false,
  error: null,
  lastFetched: null,

  fetchLocations: async (warehouseId, page = 1, limit = 20, forceRefresh = false) => {
    set({ loading: true, error: null });
    try {
      if (process.env.NODE_ENV === "development") {
        console.log(`[LocationStore] Fetching locations for warehouse ${warehouseId}`);
      }
      const data = await locationsApi.getLocations(warehouseId, page, limit);
      set({
        locations: data || [],
        loading: false,
        lastFetched: Date.now(),
      });
      return data;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to fetch locations.";
      if (process.env.NODE_ENV === "development") {
        console.error("[LocationStore] fetchLocations Error:", err);
      }
      set({ error: errorMessage, loading: false });
    }
  },

  fetchLocation: async (id: string) => {
    set({ loading: true, error: null });
    try {
      if (process.env.NODE_ENV === "development") {
        console.log(`[LocationStore] Fetching location detail for ID: ${id}`);
      }
      const location = await locationsApi.getLocation(id);
      set({ selectedLocation: location, loading: false });
      return location;
    } catch (err: any) {
      const errorMessage = err?.message || `Failed to fetch location ${id}.`;
      if (process.env.NODE_ENV === "development") {
        console.error("[LocationStore] fetchLocation Error:", err);
      }
      set({ error: errorMessage, loading: false });
    }
  },

  createLocation: async (warehouseId: string, data: LocationInput) => {
    try {
      if (process.env.NODE_ENV === "development") {
        console.log(`[LocationStore] Creating location in warehouse ${warehouseId}:`, data.name);
      }
      const createdLocation = await locationsApi.createLocation(warehouseId, data);
      set((state) => ({
        locations: [createdLocation, ...state.locations],
      }));
      return createdLocation;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to create location.";
      if (process.env.NODE_ENV === "development") {
        console.error("[LocationStore] createLocation Error.", err);
      }
      set({ error: errorMessage });
    }
  },

  updateLocation: async (id: string, data: Partial<LocationInput> & { is_active?: boolean }) => {
    try {
      if (process.env.NODE_ENV === "development") {
        console.log(`[LocationStore] Updating location: ${id}`);
      }
      const updatedLocation = await locationsApi.updateLocation(id, data);
      set((state) => ({
        locations: state.locations.map((l) => (l.id === id ? updatedLocation : l)),
        selectedLocation: state.selectedLocation?.id === id ? { ...state.selectedLocation, ...updatedLocation } : state.selectedLocation,
      }));
      return updatedLocation;
    } catch (err: any) {
      const errorMessage = err?.message || `Failed to update location ${id}.`;
      if (process.env.NODE_ENV === "development") {
        console.error("[LocationStore] updateLocation Error.", err);
      }
      set({ error: errorMessage });
    }
  },

  deleteLocation: async (id: string) => {
    try {
      if (process.env.NODE_ENV === "development") {
        console.log(`[LocationStore] Deleting location: ${id}`);
      }
      await locationsApi.deleteLocation(id);
      set((state) => ({
        locations: state.locations.filter((l) => l.id !== id),
        selectedLocation: state.selectedLocation?.id === id ? null : state.selectedLocation,
      }));
    } catch (err: any) {
      const errorMessage = err?.message || `Failed to delete location ${id}.`;
      if (process.env.NODE_ENV === "development") {
        console.error("[LocationStore] deleteLocation Error.", err);
      }
      set({ error: errorMessage });
    }
  },

  setSelectedLocation: (location) => set({ selectedLocation: location }),
  clearError: () => set({ error: null }),
}));
