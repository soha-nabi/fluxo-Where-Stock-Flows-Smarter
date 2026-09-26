"use client";

import React from "react";
import Link from "next/link";
import { Delivery } from "@/lib/api";
import { Eye, Truck, Box, Layers, Clock } from "lucide-react";

interface DeliveriesTableProps {
  deliveries: Delivery[];
}

export function DeliveriesTable({ deliveries }: DeliveriesTableProps) {
  const getBadge = (status: string) => {
    switch (status) {
      case "SHIPPED":
      case "DELIVERED":
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">Shipped</span>;
      case "PACKED":
        return <span className="px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] font-bold">Packed</span>;
      case "PICKED":
      case "PICKING":
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">Picked</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700 text-[10px] font-bold">Draft</span>;
    }
  };

  return (
    <div className="bg-[#121422] border border-[#212438] rounded-2xl overflow-hidden shadow-xl">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-[#17192b] border-b border-[#23263b] text-[11px] font-semibold text-gray-400 uppercase">
            <th className="py-3.5 px-4">Delivery #</th>
            <th className="py-3.5 px-4">Customer</th>
            <th className="py-3.5 px-4">Warehouse</th>
            <th className="py-3.5 px-4">Planned Delivery Date</th>
            <th className="py-3.5 px-4">Status Pipeline</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1e2136]">
          {deliveries.map((d) => (
            <tr key={d.id} className="hover:bg-[#181a2e]">
              <td className="py-3.5 px-4 font-mono font-bold text-white">
                <Link href={`/deliveries/${d.id}`} className="hover:text-purple-400">{d.delivery_number}</Link>
              </td>
              <td className="py-3.5 px-4 text-gray-300">{d.customer_id}</td>
              <td className="py-3.5 px-4 text-gray-300">{d.warehouse_name || d.warehouse_id}</td>
              <td className="py-3.5 px-4 font-mono text-gray-400">{new Date(d.planned_delivery_date).toLocaleDateString()}</td>
              <td className="py-3.5 px-4">{getBadge(d.status)}</td>
              <td className="py-3.5 px-4 text-right">
                <Link href={`/deliveries/${d.id}`} className="px-3 py-1.5 rounded-lg bg-[#1c1f33] hover:bg-purple-600 text-gray-300 hover:text-white transition-all border border-[#2c304f]">
                  <Eye className="w-3.5 h-3.5 inline mr-1" /> Process
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
