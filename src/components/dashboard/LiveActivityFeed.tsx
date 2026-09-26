"use me";
"use client";

import React from "react";
import { Plus, ArrowRight, Repeat, RefreshCw } from "lucide-react";
import { MOCK_LIVE_ACTIVITIES } from "@/data/mockData";
import { cn } from "@/lib/utils";

export function LiveActivityFeed() {
  return (
    <div className="rounded-3xl bg-[#0e0f17] border border-[#1e202e] p-6 shadow-2xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white font-sans tracking-wide">
          Live Activity
        </h3>
        <button className="px-3 py-1 rounded-xl bg-[#161826] border border-[#272a40] text-xs font-mono text-gray-300 hover:text-white transition-all">
          View All
        </button>
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {MOCK_LIVE_ACTIVITIES.map((act) => (
          <div
            key={act.id}
            className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-[#141624] transition-all group cursor-pointer"
          >
            {/* Round Icon Node */}
            <div
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg",
                act.type === "receipt" && "bg-teal-500/20 text-teal-400 border border-teal-500/40 shadow-teal-500/20",
                act.type === "delivery" && "bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-rose-500/20",
                act.type === "transfer" && "bg-purple-500/20 text-purple-400 border border-purple-500/40 shadow-purple-500/20",
                act.type === "adjustment" && "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-amber-500/20"
              )}
            >
              {act.type === "receipt" && <Plus className="w-4 h-4" />}
              {act.type === "delivery" && <ArrowRight className="w-4 h-4" />}
              {act.type === "transfer" && <Repeat className="w-4 h-4" />}
              {act.type === "adjustment" && <RefreshCw className="w-4 h-4" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                {act.title}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-gray-400 font-mono mt-0.5">
                <span className="truncate">{act.location}</span>
                <span>•</span>
                <span className="shrink-0">{act.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
