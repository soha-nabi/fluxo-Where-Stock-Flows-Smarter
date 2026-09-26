"use me";
"use client";

import React from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Repeat,
  Sliders,
  Clock,
  Boxes,
} from "lucide-react";
import { MOCK_RECENT_MOVEMENTS } from "@/data/mockData";
import { cn } from "@/lib/utils";

export function LiveMovementLogTable() {
  return (
    <div className="rounded-3xl bg-[#0e0f17] border border-[#1e202e] shadow-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[#1e202e] flex items-center justify-between bg-[#0e0f17]">
        <div className="flex items-center gap-2">
          <Boxes className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-bold text-white font-sans tracking-wide">
            Recent Movements
          </h3>
        </div>
        <button className="px-3.5 py-1.5 rounded-xl bg-[#161826] border border-[#272a40] text-xs font-mono text-gray-300 hover:text-white transition-all">
          View All
        </button>
      </div>

      {/* Dense Modern Telemetry Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0a0b12] text-gray-400 font-mono text-[10px] uppercase tracking-wider border-b border-[#1e202e]">
            <tr>
              <th className="py-3.5 px-6">Date & Time</th>
              <th className="py-3.5 px-4">Type</th>
              <th className="py-3.5 px-4">Reference</th>
              <th className="py-3.5 px-4">Product</th>
              <th className="py-3.5 px-4">From</th>
              <th className="py-3.5 px-4">To</th>
              <th className="py-3.5 px-4 text-right">Quantity</th>
              <th className="py-3.5 px-6 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e202e]/60 font-mono">
            {MOCK_RECENT_MOVEMENTS.map((mov) => {
              const isPositive = mov.quantity > 0;
              return (
                <tr
                  key={mov.id}
                  className="hover:bg-[#141624] transition-colors group text-gray-300"
                >
                  {/* Date & Time */}
                  <td className="py-4 px-6 text-gray-400 text-[11px]">
                    {mov.dateTime}
                  </td>

                  {/* Type */}
                  <td className="py-4 px-4 font-sans font-medium text-white">
                    <div className="flex items-center gap-2">
                      {mov.type === "Receipt" && <ArrowDownLeft className="w-3.5 h-3.5 text-teal-400" />}
                      {mov.type === "Delivery" && <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />}
                      {mov.type === "Transfer" && <Repeat className="w-3.5 h-3.5 text-purple-400" />}
                      {mov.type === "Adjustment" && <Sliders className="w-3.5 h-3.5 text-amber-400" />}
                      <span>{mov.type}</span>
                    </div>
                  </td>

                  {/* Reference */}
                  <td className="py-4 px-4 text-gray-400 font-mono text-[11px]">
                    {mov.reference}
                  </td>

                  {/* Product */}
                  <td className="py-4 px-4 font-sans font-semibold text-white group-hover:text-purple-300 transition-colors">
                    {mov.productName}
                  </td>

                  {/* From */}
                  <td className="py-4 px-4 text-gray-400 text-[11px]">
                    {mov.from}
                  </td>

                  {/* To */}
                  <td className="py-4 px-4 text-gray-400 text-[11px]">
                    {mov.to}
                  </td>

                  {/* Quantity */}
                  <td className="py-4 px-4 font-bold text-right text-xs">
                    <span className={isPositive ? "text-emerald-400" : "text-rose-400"}>
                      {isPositive ? `+${mov.quantity.toLocaleString()}` : mov.quantity.toLocaleString()}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6 text-right font-sans">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border",
                        mov.status === "Completed" &&
                          "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
                        mov.status === "In Transit" &&
                          "bg-purple-500/10 text-purple-300 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                      )}
                    >
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          mov.status === "Completed" ? "bg-emerald-400" : "bg-purple-400 animate-pulse"
                        )}
                      />
                      {mov.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
