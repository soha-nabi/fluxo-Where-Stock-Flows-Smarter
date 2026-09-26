"use client";

import React, { useEffect, useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useLocationStore } from "@/store";
import { warehousesApi, Warehouse, LocationItem, LocationInput } from "@/lib/api";
import {
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Filter,
  X,
  Warehouse as WarehouseIcon,
  Archive,
  ArrowUpDown
} from "lucide-react";

export default function LocationsPage() {
  const { locations, loading, error, fetchLocations, createLocation, clearError } = useLocationStore();
  
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("");
  const [warehousesLoading, setWarehousesLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"name" | "capacity" | "stock">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<LocationInput>({
    name: "",
    code: "",
    location_type: "RACK",
    capacity: 100,
  });

  useEffect(() => {
    const loadWarehouses = async () => {
      try {
        const whs = await warehousesApi.getWarehouses();
        setWarehouses(whs || []);
        if (whs && whs.length > 0) {
          setSelectedWarehouse(whs[0].id);
        }
      } catch (err) {
        console.error("Failed to load warehouses", err);
      } finally {
        setWarehousesLoading(false);
      }
    };
    loadWarehouses();
  }, []);

  useEffect(() => {
    if (selectedWarehouse) {
      fetchLocations(selectedWarehouse, 1, 100, true);
    }
  }, [selectedWarehouse, fetchLocations]);

  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const matchesSearch =
        loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === "ALL" || loc.location_type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [locations, searchTerm, selectedType]);

  const sortedLocations = useMemo(() => {
    return [...filteredLocations].sort((a, b) => {
      let result = 0;
      if (sortBy === "name") {
        result = a.name.localeCompare(b.name);
      } else if (sortBy === "capacity") {
        result = a.capacity - b.capacity;
      } else if (sortBy === "stock") {
        result = (a.current_stock_count || 0) - (b.current_stock_count || 0);
      }
      return sortOrder === "asc" ? result : -result;
    });
  }, [filteredLocations, sortBy, sortOrder]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarehouse || !formData.name || !formData.code) return;
    setSubmitting(true);
    await createLocation(selectedWarehouse, formData);
    setSubmitting(false);
    setIsCreateOpen(false);
    setFormData({
      name: "",
      code: "",
      location_type: "RACK",
      capacity: 100,
    });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header Title & Main Action */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121422] border border-[#212438] p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/40">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-3">
                Warehouse Locations
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800/50">
                  {filteredLocations.length} Zones
                </span>
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Manage racks, shelves, and storage zones across all your warehouses.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => selectedWarehouse && fetchLocations(selectedWarehouse, 1, 100, true)}
              disabled={loading || !selectedWarehouse}
              className="px-3.5 py-2.5 rounded-xl bg-[#1c1f33] hover:bg-[#282c47] text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-2 border border-[#2d314f] transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-400" : ""}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setIsCreateOpen(true)}
              disabled={!selectedWarehouse}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>Add Location</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={clearError} className="underline text-red-400">
              Dismiss
            </button>
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Warehouse Selector */}
          <div className="relative">
            <WarehouseIcon className="w-4 h-4 absolute left-3.5 top-3 text-blue-400" />
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              disabled={warehousesLoading}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#181a2e] border border-blue-900/50 text-xs text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
            >
              {warehousesLoading ? (
                <option value="">Loading warehouses...</option>
              ) : warehouses.length === 0 ? (
                <option value="">No warehouses found</option>
              ) : (
                warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.name} ({wh.code})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141624] border border-[#23263b] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141624] border border-[#23263b] text-xs text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
            >
              <option value="ALL">All Types</option>
              <option value="RACK">RACK</option>
              <option value="SHELF">SHELF</option>
              <option value="BIN">BIN</option>
              <option value="FLOOR">FLOOR</option>
              <option value="FREEZER">FREEZER</option>
            </select>
          </div>

          <div className="relative">
            <ArrowUpDown className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141624] border border-[#23263b] text-xs text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
            >
              <option value="name">Sort by Name</option>
              <option value="capacity">Sort by Capacity</option>
              <option value="stock">Sort by Current Stock</option>
            </select>
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="px-4 py-2.5 rounded-xl bg-[#141624] border border-[#23263b] text-xs text-gray-300 hover:text-white flex items-center justify-between cursor-pointer"
          >
            <span>Sort Order: <strong className="text-blue-400 uppercase">{sortOrder}</strong></span>
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>

        {/* Locations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading && locations.length === 0 ? (
            <div className="col-span-full p-12 text-center text-gray-400 text-xs flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
              <span>Loading locations...</span>
            </div>
          ) : sortedLocations.length === 0 ? (
            <div className="col-span-full p-12 text-center text-gray-400 text-xs flex flex-col items-center gap-3 bg-[#121422] border border-[#212438] rounded-2xl">
              <Archive className="w-10 h-10 text-gray-600" />
              <span>No locations match your criteria.</span>
            </div>
          ) : (
            sortedLocations.map((loc) => {
              const utilPercent = Math.min(100, Math.round(((loc.current_stock_count || 0) / loc.capacity) * 100)) || 0;
              let utilColor = "bg-emerald-500";
              if (utilPercent > 90) utilColor = "bg-red-500";
              else if (utilPercent > 70) utilColor = "bg-amber-500";

              return (
                <div key={loc.id} className="bg-[#121422] border border-[#212438] rounded-2xl p-5 hover:border-blue-500/50 transition-colors group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full -z-10 group-hover:bg-blue-500/10 transition-colors" />
                  
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-white font-bold text-sm mb-1">{loc.name}</h3>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="font-mono text-gray-400 bg-[#1a1c2d] px-1.5 py-0.5 rounded">{loc.code}</span>
                        <span className={`px-1.5 py-0.5 rounded border ${
                          loc.is_active 
                            ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-400' 
                            : 'bg-red-950/40 border-red-800/50 text-red-400'
                        }`}>
                          {loc.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#1a1c2d] border border-[#282b42] flex items-center justify-center shadow-inner">
                      <Archive className="w-5 h-5 text-blue-400" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Type</span>
                      <span className="text-gray-200 font-semibold">{loc.location_type}</span>
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-400">Capacity Usage</span>
                        <span className="text-gray-300 font-mono">
                          {loc.current_stock_count || 0} / {loc.capacity}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[#1e2136] rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${utilColor} rounded-full transition-all duration-500`} 
                          style={{ width: `${utilPercent}%` }} 
                        />
                      </div>
                    </div>
                    
                    {loc.current_stock_value && (
                      <div className="pt-3 mt-3 border-t border-[#1e2136] flex items-center justify-between text-xs">
                        <span className="text-gray-400">Stock Value</span>
                        <span className="text-blue-400 font-mono font-semibold">${loc.current_stock_value}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121422] border border-[#262942] w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#20233b] pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-400" />
                Add New Location
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#1e2136]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-medium">Location Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rack A-1"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">Location Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RACK-A-1"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1 font-medium">Type</label>
                  <select
                    value={formData.location_type}
                    onChange={(e) => setFormData({ ...formData, location_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="RACK">RACK</option>
                    <option value="SHELF">SHELF</option>
                    <option value="BIN">BIN</option>
                    <option value="FLOOR">FLOOR</option>
                    <option value="FREEZER">FREEZER</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-medium">Capacity (Units)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#20233b]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#1a1d30] text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white font-bold flex items-center gap-2 shadow-lg shadow-blue-900/40"
                >
                  {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>Save Location</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
