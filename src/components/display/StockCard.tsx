import React from "react";
import { Package, AlertTriangle, CheckCircle2 } from "lucide-react";

interface StockCardProps {
  productName: string;
  sku: string;
  quantity: number;
  reorderLevel: number;
  unit?: string;
  warehouseName?: string;
}

export function StockCard({
  productName,
  sku,
  quantity,
  reorderLevel,
  unit = "units",
  warehouseName,
}: StockCardProps) {
  const isLowStock = quantity <= reorderLevel;

  return (
    <div className={`p-4 rounded-2xl border transition-all shadow-lg space-y-3 ${
      isLowStock
        ? "bg-amber-950/20 border-amber-800/40 hover:border-amber-700/60"
        : "bg-[#121422] border-[#212438] hover:border-purple-500/40"
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-300 font-mono font-bold text-xs shrink-0">
            {sku.substring(0, 3)}
          </div>
          <div>
            <h4 className="text-xs font-bold text-white leading-tight">{productName}</h4>
            <span className="text-[10px] text-gray-400 font-mono">SKU: {sku}</span>
          </div>
        </div>

        {isLowStock ? (
          <span className="p-1 rounded-lg bg-amber-950 text-amber-400 border border-amber-800" title="Low Stock">
            <AlertTriangle className="w-4 h-4" />
          </span>
        ) : (
          <span className="p-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800" title="Optimal Stock">
            <CheckCircle2 className="w-4 h-4" />
          </span>
        )}
      </div>

      <div className="flex items-end justify-between pt-2 border-t border-[#20233b] text-xs">
        <div>
          {warehouseName && <span className="text-[10px] text-gray-400 block">{warehouseName}</span>}
          <span className="text-[10px] text-gray-500 font-mono">Reorder: {reorderLevel} {unit}</span>
        </div>
        <div className="text-right">
          <span className={`font-mono text-lg font-bold block ${isLowStock ? "text-amber-400" : "text-emerald-400"}`}>
            {quantity}
          </span>
          <span className="text-[10px] text-gray-400 font-mono">{unit}</span>
        </div>
      </div>
    </div>
  );
}
