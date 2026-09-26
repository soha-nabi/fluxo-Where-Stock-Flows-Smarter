"use client";

import React from "react";
import Link from "next/link";
import { Adjustment } from "@/lib/api";
import { Eye, ShieldCheck, CheckCircle2, Clock, XCircle } from "lucide-react";

interface AdjustmentsTableProps {
  adjustments: Adjustment[];
}

export function AdjustmentsTable({ adjustments }: AdjustmentsTableProps) {
  const getBadge = (status: string) => {
    switch (status) {
      case "EXECUTED":
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">Executed</span>;
      case "APPROVED":
        return <span className="px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-bold">Approved</span>;
      case "REJECTED":
        return <span className="px-2.5 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800 text-[10px] font-bold">Rejected</span>;
      case "PENDING_APPROVAL":
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">Pending Approval</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700 text-[10px] font-bold">Draft</span>;
    }
  };

  return (
    <div className="bg-[#121422] border border-[#212438] rounded-2xl overflow-hidden shadow-xl">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-[#17192b] border-b border-[#23263b] text-[11px] font-semibold text-gray-400 uppercase">
            <th className="py-3.5 px-4">Adjustment #</th>
            <th className="py-3.5 px-4">Product ID</th>
            <th className="py-3.5 px-4">System → Physical Count</th>
            <th className="py-3.5 px-4">Variance Diff</th>
            <th className="py-3.5 px-4">Reason Code</th>
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1e2136]">
          {adjustments.map((a) => (
            <tr key={a.id} className="hover:bg-[#181a2e]">
              <td className="py-3.5 px-4 font-mono font-bold text-white">
                <Link href={`/adjustments/${a.id}`} className="hover:text-purple-400">{a.adjustment_number}</Link>
              </td>
              <td className="py-3.5 px-4 text-gray-300 font-bold">{a.product_name || a.product_id}</td>
              <td className="py-3.5 px-4 font-mono text-gray-300">
                {a.quantity_before} → <strong className="text-white">{a.quantity_after}</strong>
              </td>
              <td className="py-3.5 px-4 font-mono font-bold">
                <span className={a.quantity_diff >= 0 ? "text-emerald-400" : "text-amber-400"}>
                  {a.quantity_diff > 0 ? `+${a.quantity_diff}` : a.quantity_diff}
                </span>
              </td>
              <td className="py-3.5 px-4 font-mono text-gray-300">{a.reason}</td>
              <td className="py-3.5 px-4">{getBadge(a.status)}</td>
              <td className="py-3.5 px-4 text-right">
                <Link href={`/adjustments/${a.id}`} className="px-3 py-1.5 rounded-lg bg-[#1c1f33] hover:bg-purple-600 text-gray-300 hover:text-white transition-all border border-[#2c304f]">
                  <Eye className="w-3.5 h-3.5 inline mr-1" /> View Audit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
