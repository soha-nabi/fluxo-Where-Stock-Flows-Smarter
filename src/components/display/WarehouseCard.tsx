import React from "react";
import { Warehouse as WarehouseIcon, MapPin, Activity } from "lucide-react";

interface WarehouseCardProps {
  name: string;
  code?: string;
  city?: string;
  skus: number;
  capacity: number;
  utilization: number;
  health: number;
  lowStockItems?: number;
  onClick?: () => void;
}

export function WarehouseCard({
  name,
  code,
  city = "Austin, TX",
  skus,
  capacity,
  utilization,
  health,
  lowStockItems = 0,
  onClick,
}: WarehouseCardProps) {
  return (
    <div
      onClick={onClick}
      className="p-5 rounded-2xl bg-[#121422] border border-[#212438] hover:border-purple-500/50 transition-all shadow-xl space-y-4 cursor-pointer group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
            <WarehouseIcon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">{name}</h4>
            <span className="text-[10px] text-gray-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-purple-400" /> {city} {code ? `(${code})` : ""}
            </span>
          </div>
        </div>

        <div className="px-2.5 py-1 rounded-full bg-purple-950/70 border border-purple-800/60 text-purple-300 text-[10px] font-bold font-mono">
          {health}% Health
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#20233b] text-center text-xs">
        <div className="p-2 rounded-xl bg-[#17192a] border border-[#252842]">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-medium">SKUs</span>
          <span className="font-mono font-bold text-white text-sm mt-0.5 block">{skus.toLocaleString()}</span>
        </div>

        <div className="p-2 rounded-xl bg-[#17192a] border border-[#252842]">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-medium">Utilization</span>
          <span className="font-mono font-bold text-emerald-400 text-sm mt-0.5 block">{utilization}%</span>
        </div>

        <div className="p-2 rounded-xl bg-[#17192a] border border-[#252842]">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-medium">Low Stock</span>
          <span className="font-mono font-bold text-amber-400 text-sm mt-0.5 block">{lowStockItems}</span>
        </div>
      </div>
    </div>
  );
}
