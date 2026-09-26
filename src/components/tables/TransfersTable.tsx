"use client";

import React from "react";
import Link from "next/link";
import { Transfer } from "@/lib/api";
import { Eye, ArrowRight, Truck, CheckCircle2, Clock, XCircle } from "lucide-react";

interface TransfersTableProps {
  transfers: Transfer[];
}

export function TransfersTable({ transfers }: TransfersTableProps) {
  const getBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">Completed</span>;
      case "IN_TRANSIT":
        return <span className="px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-bold">In Transit</span>;
      case "CANCELED":
        return <span className="px-2.5 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800 text-[10px] font-bold">Canceled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">Pending Approval</span>;
    }
  };

  return (
    <div className="bg-[#121422] border border-[#212438] rounded-2xl overflow-hidden shadow-xl">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-[#17192b] border-b border-[#23263b] text-[11px] font-semibold text-gray-400 uppercase">
            <th className="py-3.5 px-4">Transfer #</th>
            <th className="py-3.5 px-4">Product</th>
            <th className="py-3.5 px-4">From → To Route</th>
            <th className="py-3.5 px-4">Quantity</th>
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1e2136]">
          {transfers.map((t) => (
            <tr key={t.id} className="hover:bg-[#181a2e]">
              <td className="py-3.5 px-4 font-mono font-bold text-white">
                <Link href={`/transfers/${t.id}`} className="hover:text-purple-400">{t.transfer_number}</Link>
              </td>
              <td className="py-3.5 px-4 text-gray-300 font-bold">{t.product_name || t.product_id}</td>
              <td className="py-3.5 px-4">
                <div className="flex items-center gap-1.5 font-semibold text-gray-300 text-[11px]">
                  <span>{t.from_warehouse_name || t.from_warehouse_id}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                  <span>{t.to_warehouse_name || t.to_warehouse_id}</span>
                </div>
              </td>
              <td className="py-3.5 px-4 font-mono font-bold text-purple-300">{t.quantity} units</td>
              <td className="py-3.5 px-4">{getBadge(t.status)}</td>
              <td className="py-3.5 px-4 text-right">
                <Link href={`/transfers/${t.id}`} className="px-3 py-1.5 rounded-lg bg-[#1c1f33] hover:bg-purple-600 text-gray-300 hover:text-white transition-all border border-[#2c304f]">
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
