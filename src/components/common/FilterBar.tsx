"use client";

import React, { useEffect, useState } from "react";
import { useStore } from "@/store";
import { warehousesApi, Warehouse } from "@/lib/api";
import { Warehouse as WarehouseIcon, Calendar, Filter } from "lucide-react";

interface FilterBarProps {
  onWarehouseChange?: (warehouse: Warehouse | null) => void;
  onDateRangeChange?: (range: "7d" | "30d" | "90d" | "all") => void;
}

export function FilterBar({ onWarehouseChange, onDateRangeChange }: FilterBarProps) {
  const { selectedWarehouse, dateRange, setSelectedWarehouse, setDateRange } = useStore();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  useEffect(() => {
    warehousesApi.getWarehouses().then((res) => setWarehouses(res || [])).catch(() => {});
  }, []);

  const handleWarehouseSelect = (id: string) => {
    if (id === "ALL") {
      setSelectedWarehouse(null);
      if (onWarehouseChange) onWarehouseChange(null);
    } else {
      const found = warehouses.find((w) => w.id === id) || null;
      setSelectedWarehouse(found);
      if (onWarehouseChange) onWarehouseChange(found);
    }
  };

  const handleRangeSelect = (range: "7d" | "30d" | "90d" | "all") => {
    setDateRange(range);
    if (onDateRangeChange) onDateRangeChange(range);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#121422] border border-[#212438] shadow-lg text-xs">
      <div className="flex items-center gap-3">
        <Filter className="w-4 h-4 text-purple-400" />
        <span className="font-bold text-white">Global Filters</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Warehouse Filter */}
        <div className="flex items-center gap-2 bg-[#181a2e] border border-[#282c47] rounded-xl px-3 py-1.5">
          <WarehouseIcon className="w-4 h-4 text-purple-400" />
          <select
            value={selectedWarehouse ? selectedWarehouse.id : "ALL"}
            onChange={(e) => handleWarehouseSelect(e.target.value)}
            className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-[#121422]">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id} className="bg-[#121422]">
                {w.name} ({w.code})
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Filter */}
        <div className="flex items-center gap-2 bg-[#181a2e] border border-[#282c47] rounded-xl px-3 py-1.5">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <select
            value={dateRange}
            onChange={(e) => handleRangeSelect(e.target.value as any)}
            className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
          >
            <option value="7d" className="bg-[#121422]">Last 7 Days</option>
            <option value="30d" className="bg-[#121422]">Last 30 Days</option>
            <option value="90d" className="bg-[#121422]">Last 90 Days</option>
            <option value="all" className="bg-[#121422]">All Time</option>
          </select>
        </div>
      </div>
    </div>
  );
}
