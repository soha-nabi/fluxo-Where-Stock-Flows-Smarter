"use me";
"use client";

import React, { useState, useEffect } from "react";
import { Search, Package, Warehouse, X } from "lucide-react";
import { MOCK_RECENT_MOVEMENTS, MOCK_WAREHOUSE_NODES } from "@/data/mockData";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredMovements = MOCK_RECENT_MOVEMENTS.filter(
    (m) =>
      m.reference.toLowerCase().includes(query.toLowerCase()) ||
      m.productName.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0f111a] border border-[#1e202e] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Input area */}
        <div className="p-4 border-b border-[#1e202e] flex items-center gap-3 bg-[#0a0b12]">
          <Search className="w-5 h-5 text-purple-400" />
          <input
            type="text"
            placeholder="Type product name, reference #, or warehouse node..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#161824]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="p-3 overflow-y-auto space-y-3 flex-1 text-xs">
          <div>
            <div className="px-3 py-1 text-[10px] font-mono uppercase text-gray-500 font-semibold">
              Recent Inventory Telemetry
            </div>
            {filteredMovements.slice(0, 4).map((m) => (
              <div
                key={m.id}
                onClick={onClose}
                className="px-3 py-2.5 rounded-xl hover:bg-[#161824] flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-white group-hover:text-purple-300 transition-colors flex items-center gap-2">
                      <span>{m.productName}</span>
                      <span className="font-mono text-[10px] text-gray-400">{m.reference}</span>
                    </div>
                    <div className="text-gray-400 text-[11px] font-mono">
                      {m.from} → {m.to}
                    </div>
                  </div>
                </div>
                <span className="font-mono text-emerald-400 font-bold">{m.quantity} units</span>
              </div>
            ))}
          </div>

          <div>
            <div className="px-3 py-1 text-[10px] font-mono uppercase text-gray-500 font-semibold">
              Active Warehouse Nodes
            </div>
            {MOCK_WAREHOUSE_NODES.map((wh) => (
              <div
                key={wh.id}
                onClick={onClose}
                className="px-3 py-2.5 rounded-xl hover:bg-[#161824] flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                    <Warehouse className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-white group-hover:text-sky-300 transition-colors">
                      {wh.name} Warehouse
                    </div>
                    <div className="text-gray-400 text-[11px] font-mono">Status: {wh.status}</div>
                  </div>
                </div>
                <span className="font-mono text-purple-300 font-bold">{wh.skus.toLocaleString()} SKUs</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#1e202e] bg-[#0a0b12] flex items-center justify-between text-[11px] text-gray-500 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span>Fluxo Mission Control Omni-Search</span>
        </div>
      </div>
    </div>
  );
}
