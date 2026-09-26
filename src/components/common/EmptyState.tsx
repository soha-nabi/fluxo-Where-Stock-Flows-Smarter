import React from "react";
import { Boxes, Plus } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ElementType;
}

export function EmptyState({
  title = "No data found",
  description = "No records match your criteria. Try adjusting filters or create a new entry.",
  actionLabel,
  onAction,
  icon: Icon = Boxes,
}: EmptyStateProps) {
  return (
    <div className="p-12 text-center text-gray-400 text-xs flex flex-col items-center justify-center gap-3 bg-[#121422] border border-[#212438] rounded-2xl shadow-xl">
      <div className="w-12 h-12 rounded-2xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-center text-purple-400">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-white mt-1">{title}</h3>
      <p className="max-w-md text-gray-400 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-900/40"
        >
          <Plus className="w-4 h-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
