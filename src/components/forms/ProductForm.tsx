"use client";

import React, { useState } from "react";
import { ProductInput } from "@/lib/api";
import { Package, Save, RefreshCw } from "lucide-react";

interface ProductFormProps {
  initialValues?: Partial<ProductInput>;
  onSubmit: (data: ProductInput) => Promise<void>;
  onCancel?: () => void;
  isEdit?: boolean;
}

export function ProductForm({ initialValues, onSubmit, onCancel, isEdit = false }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductInput>({
    sku: initialValues?.sku || "",
    name: initialValues?.name || "",
    category: initialValues?.category || "MATERIALS",
    unit: initialValues?.unit || "units",
    reorder_level: initialValues?.reorder_level || 10,
    description: initialValues?.description || "",
    image_url: initialValues?.image_url || "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-400 mb-1 font-medium">SKU Code *</label>
          <input
            type="text"
            required
            disabled={isEdit}
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-gray-400 mb-1 font-medium">Unit of Measure</label>
          <input
            type="text"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-gray-400 mb-1 font-medium">Product Name *</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-400 mb-1 font-medium">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white"
          >
            <option value="MATERIALS">MATERIALS</option>
            <option value="ELECTRONICS">ELECTRONICS</option>
            <option value="FURNITURE">FURNITURE</option>
            <option value="TOOLS">TOOLS</option>
            <option value="OTHER">OTHER</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-400 mb-1 font-medium">Reorder Threshold</label>
          <input
            type="number"
            min="1"
            value={formData.reorder_level}
            onChange={(e) => setFormData({ ...formData, reorder_level: Number(e.target.value) })}
            className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white font-mono"
          />
        </div>
      </div>

      <div>
        <label className="block text-gray-400 mb-1 font-medium">Description</label>
        <textarea
          rows={3}
          value={formData.description || ""}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2f4c] text-white"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#20233b]">
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl bg-[#1c1f33] text-gray-300">
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-2"
        >
          {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
          <Save className="w-4 h-4" />
          <span>{isEdit ? "Update Product" : "Save Product"}</span>
        </button>
      </div>
    </form>
  );
}
