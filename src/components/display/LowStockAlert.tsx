import React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

interface LowStockAlertProps {
  count: number;
  onViewClick?: () => void;
}

export function LowStockAlert({ count, onViewClick }: LowStockAlertProps) {
  if (count <= 0) return null;

  return (
    <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-950 border border-amber-700/60 flex items-center justify-center text-amber-400 shrink-0">
          <AlertTriangle className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h4 className="font-bold text-white text-xs">
            {count} Product SKU{count > 1 ? "s" : ""} Below Reorder Threshold
          </h4>
          <p className="text-amber-300/80 text-[11px] mt-0.5">
            Automated replenishment signals triggered. Review stock allocations and generate purchase orders.
          </p>
        </div>
      </div>

      {onViewClick ? (
        <button
          onClick={onViewClick}
          className="px-3.5 py-2 rounded-xl bg-amber-900/80 hover:bg-amber-800 text-amber-100 font-bold text-xs flex items-center gap-1.5 border border-amber-700/60 transition-all shrink-0"
        >
          <span>View Items</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      ) : (
        <Link
          href="/reports?tab=low_stock"
          className="px-3.5 py-2 rounded-xl bg-amber-900/80 hover:bg-amber-800 text-amber-100 font-bold text-xs flex items-center gap-1.5 border border-amber-700/60 transition-all shrink-0"
        >
          <span>View Report</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}
