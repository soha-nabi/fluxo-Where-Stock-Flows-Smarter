"use client";

import React from "react";
import Link from "next/link";
import { Receipt } from "@/lib/api";
import { Eye, CheckCircle2, Clock, Boxes } from "lucide-react";

interface ReceiptsTableProps {
  receipts: Receipt[];
}

export function ReceiptsTable({ receipts }: ReceiptsTableProps) {
  const getBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">Completed</span>;
      case "VALIDATED":
        return <span className="px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-bold">Validated</span>;
      case "RECEIVED":
        return <span className="px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-bold">Received</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700 text-[10px] font-bold">Draft</span>;
    }
  };

  return (
    <div className="bg-[#121422] border border-[#212438] rounded-2xl overflow-hidden shadow-xl">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-[#17192b] border-b border-[#23263b] text-[11px] font-semibold text-gray-400 uppercase">
            <th className="py-3.5 px-4">Receipt #</th>
            <th className="py-3.5 px-4">Supplier</th>
            <th className="py-3.5 px-4">Warehouse</th>
            <th className="py-3.5 px-4">Expected Date</th>
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1e2136]">
          {receipts.map((r) => (
            <tr key={r.id} className="hover:bg-[#181a2e]">
              <td className="py-3.5 px-4 font-mono font-bold text-white">
                <Link href={`/receipts/${r.id}`} className="hover:text-purple-400">{r.receipt_number}</Link>
              </td>
              <td className="py-3.5 px-4 text-gray-300">{r.supplier_name || r.supplier_id}</td>
              <td className="py-3.5 px-4 text-gray-300">{r.warehouse_name || r.warehouse_id}</td>
              <td className="py-3.5 px-4 font-mono text-gray-400">{new Date(r.expected_date).toLocaleDateString()}</td>
              <td className="py-3.5 px-4">{getBadge(r.status)}</td>
              <td className="py-3.5 px-4 text-right">
                <Link href={`/receipts/${r.id}`} className="px-3 py-1.5 rounded-lg bg-[#1c1f33] hover:bg-purple-600 text-gray-300 hover:text-white transition-all border border-[#2c304f]">
                  <Eye className="w-3.5 h-3.5 inline mr-1" /> View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
