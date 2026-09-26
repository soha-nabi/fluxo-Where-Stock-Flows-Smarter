"use me";
"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { MOCK_BAR_CHART_DATA } from "@/data/mockData";

export function StockMovementChart() {
  const maxValue = 2500;

  return (
    <div className="rounded-3xl bg-[#0e0f17] border border-[#1e202e] p-6 shadow-2xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white font-sans tracking-wide">
          Stock Movement
        </h3>
        <button className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#161826] border border-[#272a40] text-xs font-mono text-gray-300 hover:text-white">
          <span>Last 7 Days</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>

      {/* Chart Viewport */}
      <div className="flex items-end justify-between gap-3 h-48 pt-6 pb-2 px-2 relative">
        {/* Horizontal grid lines */}
        <div className="absolute inset-x-0 top-6 border-b border-[#1c1e2e] text-[10px] font-mono text-gray-600 pl-1">
          2.5K
        </div>
        <div className="absolute inset-x-0 top-1/2 border-b border-[#1c1e2e] text-[10px] font-mono text-gray-600 pl-1">
          1.5K
        </div>
        <div className="absolute inset-x-0 bottom-8 border-b border-[#1c1e2e] text-[10px] font-mono text-gray-600 pl-1">
          500
        </div>

        {/* Bars */}
        {MOCK_BAR_CHART_DATA.map((item, idx) => {
          const heightPercent = (item.value / maxValue) * 100;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end z-10 group cursor-pointer">
              <div
                className="w-full max-w-[28px] rounded-t-xl bg-gradient-to-t from-[#4c1d95] via-[#7c3aed] to-[#c084fc] group-hover:brightness-125 transition-all shadow-[0_0_15px_rgba(124,58,237,0.4)] relative"
                style={{ height: `${heightPercent}%` }}
              >
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-[#161826] border border-[#2b2e45] text-white text-[10px] font-mono px-2 py-0.5 rounded shadow-xl whitespace-nowrap pointer-events-none">
                  {item.value} units
                </div>
              </div>
              <span className="text-[11px] font-mono text-gray-400 font-medium">
                {item.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
