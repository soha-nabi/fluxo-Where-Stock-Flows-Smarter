"use me";
"use client";

import React from "react";
import { MOCK_HEALTH_DATA } from "@/data/mockData";

export function InventoryHealthSection() {
  return (
    <div className="rounded-3xl bg-[#0e0f17] border border-[#1e202e] p-6 shadow-2xl flex flex-col justify-between">
      <h3 className="text-sm font-bold text-white font-sans tracking-wide mb-4">
        Inventory Health
      </h3>

      <div className="flex items-center gap-6 my-2">
        {/* Glowing 95% Circular Radial Ring */}
        <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-[#1a1c2b]"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]"
              strokeDasharray="95, 100"
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-2xl font-extrabold text-white font-mono">
              {MOCK_HEALTH_DATA.percentage}%
            </span>
          </div>
        </div>

        {/* Status description */}
        <div className="space-y-1">
          <span className="text-base font-bold text-emerald-400 font-sans block">
            {MOCK_HEALTH_DATA.statusText}
          </span>
          <p className="text-xs text-gray-400 leading-snug">
            {MOCK_HEALTH_DATA.description}
          </p>
        </div>
      </div>

      {/* Legend items */}
      <div className="space-y-2 pt-4 border-t border-[#1e202e] text-xs font-mono">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-gray-300">In Stock</span>
          </div>
          <span className="font-bold text-white">
            {MOCK_HEALTH_DATA.inStock.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
            <span className="text-gray-300">Low Stock</span>
          </div>
          <span className="font-bold text-white">
            {MOCK_HEALTH_DATA.lowStock.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]" />
            <span className="text-gray-300">Out of Stock</span>
          </div>
          <span className="font-bold text-white">
            {MOCK_HEALTH_DATA.outOfStock.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
