"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useProductStore } from "@/store";
import { Product, ProductInput } from "@/lib/api";
import {
  Package,
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Warehouse,
  Boxes,
  RefreshCw,
  X,
  Eye,
} from "lucide-react";

export default function ProductsPage() {
  const { products, loading, error, fetchProducts, createProduct, clearError } = useProductStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"name" | "sku" | "stock">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  // Modal State for New Product
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState<ProductInput>({
    sku: "",
    name: "",
    category: "MATERIALS",
    unit: "units",
    reorder_level: 10,
    description: "",
    image_url: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter & Search Logic
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sorting Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "name") {
      return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    } else if (sortBy === "sku") {
      return sortOrder === "asc" ? a.sku.localeCompare(b.sku) : b.sku.localeCompare(a.sku);
    } else {
      const stockA = a.total_stock || 0;
      const stockB = b.total_stock || 0;
      return sortOrder === "asc" ? stockA - stockB : stockB - stockA;
    }
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) return;
    setSubmitting(true);
    await createProduct(formData);
    setSubmitting(false);
    setIsCreateOpen(false);
    setFormData({
      sku: "",
      name: "",
      category: "MATERIALS",
      unit: "units",
      reorder_level: 10,
      description: "",
      image_url: "",
    });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header Title & Main Action */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121422] border border-[#212438] p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-900/40">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-3">
                Products Inventory Catalog
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/50">
                  {filteredProducts.length} Items
                </span>
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Manage stock levels, reorder thresholds, and warehouse distributions across all SKUs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchProducts(undefined, true)}
              disabled={loading}
              className="px-3.5 py-2.5 rounded-xl bg-[#1c1f33] hover:bg-[#282c47] text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-2 border border-[#2d314f] transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-purple-400" : ""}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-900/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={clearError} className="underline text-red-400">
              Dismiss
            </button>
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search SKU or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141624] border border-[#23263b] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141624] border border-[#23263b] text-xs text-white focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="MATERIALS">Raw Materials</option>
              <option value="ELECTRONICS">Electronics</option>
              <option value="FURNITURE">Furniture</option>
              <option value="TOOLS">Tools & Equipment</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Sort By Select */}
          <div className="relative">
            <ArrowUpDown className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141624] border border-[#23263b] text-xs text-white focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
            >
              <option value="name">Sort by Name</option>
              <option value="sku">Sort by SKU</option>
              <option value="stock">Sort by Stock Level</option>
            </select>
          </div>

          {/* Sort Order Toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="px-4 py-2.5 rounded-xl bg-[#141624] border border-[#23263b] text-xs text-gray-300 hover:text-white flex items-center justify-between cursor-pointer"
          >
            <span>Sort Order: <strong className="text-purple-400 uppercase">{sortOrder}</strong></span>
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>

        {/* Products Table */}
        <div className="bg-[#121422] border border-[#212438] rounded-2xl overflow-hidden shadow-xl">
          {loading && products.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-xs flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
              <span>Loading product catalog...</span>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-xs flex flex-col items-center gap-3">
              <Boxes className="w-10 h-10 text-gray-600" />
              <span>No products match your criteria. Try adjusting filters or create a new product.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#17192b] border-b border-[#23263b] text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Product / SKU</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Stock Level</th>
                    <th className="py-3.5 px-4">Reorder Point</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2136] text-xs">
                  {sortedProducts.map((product) => {
                    const totalStock = product.total_stock || 0;
                    const isLowStock = totalStock <= product.reorder_level;
                    const isExpanded = expandedProductId === product.id;

                    return (
                      <React.Fragment key={product.id}>
                        <tr className="hover:bg-[#181a2e] transition-colors group">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-purple-950/60 border border-purple-800/40 flex items-center justify-center font-mono text-xs font-bold text-purple-300 shrink-0">
                                {product.sku.substring(0, 3)}
                              </div>
                              <div className="flex flex-col">
                                <Link
                                  href={`/products/${product.id}`}
                                  className="font-semibold text-white hover:text-purple-400 transition-colors"
                                >
                                  {product.name}
                                </Link>
                                <span className="text-[10px] text-gray-400 font-mono">
                                  SKU: {product.sku}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-lg bg-[#1a1d30] text-gray-300 border border-[#2b2f4c] text-[10px] font-semibold">
                              {product.category}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className={`font-mono font-bold text-sm ${isLowStock ? "text-amber-400" : "text-emerald-400"}`}>
                                {totalStock}
                              </span>
                              <span className="text-[10px] text-gray-500">{product.unit}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-gray-400 font-mono">
                            {product.reorder_level} {product.unit}
                          </td>

                          <td className="py-3.5 px-4">
                            {isLowStock ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-800/50 text-amber-300 text-[10px] font-bold">
                                <AlertTriangle className="w-3 h-3" />
                                Low Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-[10px] font-bold">
                                In Stock
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setExpandedProductId(isExpanded ? null : product.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-[#1b1e33] hover:bg-[#252945] text-gray-300 text-[11px] font-medium flex items-center gap-1 border border-[#2a2e4c]"
                              >
                                <Warehouse className="w-3.5 h-3.5 text-purple-400" />
                                <span>Warehouses</span>
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>

                              <Link
                                href={`/products/${product.id}`}
                                className="p-1.5 rounded-lg bg-[#1b1e33] hover:bg-purple-600 text-gray-300 hover:text-white transition-all border border-[#2a2e4c]"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                            </div>
                          </td>
                        </tr>

                        {/* Expandable Warehouse Breakdown */}
                        {isExpanded && (
                          <tr className="bg-[#151728] border-b border-[#212438]">
                            <td colSpan={6} className="p-4">
                              <div className="bg-[#0f111f] p-4 rounded-xl border border-[#24273d] space-y-3">
                                <h4 className="text-xs font-bold text-gray-300 flex items-center gap-2">
                                  <Warehouse className="w-4 h-4 text-purple-400" />
                                  Warehouse Distribution Breakdown for {product.name}
                                </h4>

                                {product.warehouses && product.warehouses.length > 0 ? (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    {product.warehouses.map((wh, idx) => (
                                      <div key={idx} className="p-3 rounded-lg bg-[#181a2d] border border-[#282c47] flex items-center justify-between text-xs">
                                        <span className="font-medium text-white">{wh.warehouse}</span>
                                        <span className={`font-mono font-bold ${wh.low_stock ? "text-amber-400" : "text-emerald-400"}`}>
                                          {wh.quantity} {product.unit}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-gray-500 italic">No specific warehouse allocations recorded yet.</p>
                                )}
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
          )}
        </div>
      </div>

      {/* Create Product Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121422] border border-[#262942] w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#20233b] pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-400" />
                Add New Product SKU
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#1e2136]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1 font-medium">SKU Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MAT-005"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-medium">Unit of Measure</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aluminum Extrusion Bar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1 font-medium">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="MATERIALS">MATERIALS</option>
                    <option value="ELECTRONICS">ELECTRONICS</option>
                    <option value="FURNITURE">FURNITURE</option>
                    <option value="TOOLS">TOOLS</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-medium">Reorder Threshold Level</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.reorder_level}
                    onChange={(e) => setFormData({ ...formData, reorder_level: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">Description</label>
                <textarea
                  rows={3}
                  placeholder="Optional specification notes..."
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#20233b]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#1a1d30] text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-bold flex items-center gap-2 shadow-lg shadow-purple-900/40"
                >
                  {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>Save Product</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
