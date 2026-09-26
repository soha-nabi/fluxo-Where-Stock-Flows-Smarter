"use me";
"use client";

import React from "react";
import { Search, MapPin, Bell, ChevronDown, Menu, Database } from "lucide-react";
import { useStore } from "@/store";

interface HeaderProps {
  onOpenSearch: () => void;
  onMobileToggle: () => void;
}

export function Header({ onOpenSearch, onMobileToggle }: HeaderProps) {
  const { selectedWarehouse, setSelectedWarehouse } = useStore();

  return (
    <header className="h-16 px-4 lg:px-8 border-b border-[#1e202e] bg-[#090a10]/80 backdrop-blur-xl sticky top-0 z-20 flex items-center justify-between gap-4 select-none">
      {/* Left side: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onMobileToggle}
          className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#161824] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Input */}
        <div
          onClick={onOpenSearch}
          className="flex-1 flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#12141f] border border-[#1e202e] hover:border-[#3b3f5c] text-gray-400 hover:text-gray-200 cursor-pointer transition-all shadow-inner group"
        >
          <Search className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
          <span className="text-xs text-gray-400 truncate flex-1">
            Search products, SKU, locations, or documents...
          </span>
          <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-lg bg-[#1c1f30] text-gray-400 border border-[#2d3148]">
            <span>⌘</span>K
          </kbd>
        </div>
      </div>

      {/* Right side: Live System Status, Warehouse selector, notifications, user avatar */}
      <div className="flex items-center gap-3">
        {/* POSTGRES LIVE Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-[10px] font-mono font-bold shadow-[0_0_12px_rgba(16,185,129,0.2)]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span>POSTGRES LIVE</span>
        </div>

        {/* Warehouse Dropdown */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#12141f] border border-[#1e202e] text-xs font-medium text-gray-300">
          <MapPin className="w-3.5 h-3.5 text-purple-400" />
          <span className="font-semibold text-white">
            {selectedWarehouse ? selectedWarehouse.name : "All Warehouses"}
          </span>
        </div>

        {/* Notifications */}
        <button className="p-2 rounded-xl bg-[#12141f] border border-[#1e202e] text-gray-400 hover:text-white hover:bg-[#1c1f30] transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-500 ring-2 ring-[#090a10] animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-500 ring-2 ring-[#090a10]" />
        </button>

        {/* Profile Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 p-0.5 shadow-lg cursor-pointer hover:scale-105 transition-transform">
          <div className="w-full h-full rounded-full bg-[#12141f] flex items-center justify-center font-bold text-xs text-white">
            SN
          </div>
        </div>
      </div>
    </header>
  );
}
