"use client";

import React from "react";
import Link from "next/link";
import { Product } from "@/lib/api";
import { AlertTriangle, CheckCircle2, Eye, Warehouse, ChevronDown, ChevronUp } from "lucide-react";

interface ProductsTableProps {
  products: Product[];
  onExpandWarehouse?: (id: string) => void;
  expandedId?: string | null;
}

export function ProductsTable({ products, onExpandWarehouse, expandedId }: ProductsTableProps) {
  return (
    <div className="bg-[#121422] border border-[#212438] rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#17192b] border-b border-[#23263b] text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              <th className="py-3.5 px-4">Product / SKU</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Total Stock</th>
              <th className="py-3.5 px-4">Reorder Level</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2136]">
            {products.map((product) => {
              const totalStock = product.total_stock || 0;
              const isLowStock = totalStock <= product.reorder_level;
              const isExpanded = expandedId === product.id;

              return (
                <React.Fragment key={product.id}>
                  <tr className="hover:bg-[#181a2e] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-950/60 border border-purple-800/40 flex items-center justify-center font-mono text-xs font-bold text-purple-300 shrink-0">
                          {product.sku.substring(0, 3)}
                        </div>
                        <div className="flex flex-col">
                          <Link href={`/products/${product.id}`} className="font-bold text-white hover:text-purple-400">
                            {product.name}
                          </Link>
                          <span className="text-[10px] text-gray-400 font-mono">SKU: {product.sku}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-[#1a1d30] text-gray-300 border border-[#2b2f4c] text-[10px] font-semibold">
                        {product.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span className={isLowStock ? "text-amber-400" : "text-emerald-400"}>
                        {totalStock} {product.unit}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-gray-400">
                      {product.reorder_level} {product.unit}
                    </td>

                    <td className="py-3.5 px-4">
                      {isLowStock ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-800/50 text-amber-300 text-[10px] font-bold">
                          <AlertTriangle className="w-3 h-3" /> Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> In Stock
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {onExpandWarehouse && (
                          <button
                            onClick={() => onExpandWarehouse(product.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#1b1e33] hover:bg-[#252945] text-gray-300 text-[11px] font-medium flex items-center gap-1 border border-[#2a2e4c]"
                          >
                            <Warehouse className="w-3.5 h-3.5 text-purple-400" />
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        )}
                        <Link
                          href={`/products/${product.id}`}
                          className="p-1.5 rounded-lg bg-[#1b1e33] hover:bg-purple-600 text-gray-300 hover:text-white transition-all border border-[#2a2e4c]"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>

                  {isExpanded && product.warehouses && (
                    <tr className="bg-[#151728]">
                      <td colSpan={6} className="p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {product.warehouses.map((wh, idx) => (
                            <div key={idx} className="p-3 rounded-lg bg-[#181a2d] border border-[#282c47] flex justify-between text-xs">
                              <span className="font-bold text-white">{wh.warehouse}</span>
                              <span className="font-mono text-purple-300">{wh.quantity} units</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
