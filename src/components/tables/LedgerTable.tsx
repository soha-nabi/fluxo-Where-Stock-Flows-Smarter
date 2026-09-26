"use client";

import React from "react";
import { LedgerEntry } from "@/lib/api";
import { Clock } from "lucide-react";

interface LedgerTableProps {
  entries: LedgerEntry[];
}

export function LedgerTable({ entries }: LedgerTableProps) {
  return (
    <div className="bg-[#121422] border border-[#212438] rounded-2xl overflow-hidden shadow-xl">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-[#17192b] border-b border-[#23263b] text-[11px] font-semibold text-gray-400 uppercase">
            <th className="py-3.5 px-4">Operation / Ref</th>
            <th className="py-3.5 px-4">Product</th>
            <th className="py-3.5 px-4">Warehouse</th>
            <th className="py-3.5 px-4">Quantity Change</th>
            <th className="py-3.5 px-4">Before → After</th>
            <th className="py-3.5 px-4">Date & Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1e2136]">
          {entries.map((entry) => (
            <tr key={entry.id} className="hover:bg-[#181a2e]">
              <td className="py-3.5 px-4">
                <span className="font-bold text-white block">{entry.operation}</span>
                <span className="text-[10px] text-gray-400 font-mono">Ref: {entry.reference}</span>
              </td>
              <td className="py-3.5 px-4 text-gray-200">{entry.product}</td>
              <td className="py-3.5 px-4 text-gray-300">{entry.warehouse}</td>
              <td className="py-3.5 px-4 font-mono font-bold">
                <span className={entry.quantity_change >= 0 ? "text-emerald-400" : "text-amber-400"}>
                  {entry.quantity_change > 0 ? `+${entry.quantity_change}` : entry.quantity_change}
                </span>
              </td>
              <td className="py-3.5 px-4 font-mono text-gray-400">
                {entry.quantity_before} → {entry.quantity_after}
              </td>
              <td className="py-3.5 px-4 font-mono text-gray-400">
                {new Date(entry.date).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
