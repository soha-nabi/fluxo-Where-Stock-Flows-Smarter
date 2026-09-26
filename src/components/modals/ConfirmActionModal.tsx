"use client";

import React from "react";
import { AlertCircle, X, CheckCircle2, RefreshCw } from "lucide-react";

interface ConfirmActionModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmActionModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDanger = false,
  loading = false,
  onConfirm,
  onClose,
}: ConfirmActionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#121422] border border-[#262942] w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-[#20233b] pb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertCircle className={`w-5 h-5 ${isDanger ? "text-red-400" : "text-purple-400"}`} />
            {title}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed">{message}</p>

        <div className="flex items-center justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-[#1c1f33] hover:bg-[#282c47] text-gray-300 text-xs font-semibold"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 ${
              isDanger
                ? "bg-red-600 hover:bg-red-500 text-white"
                : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white shadow-lg shadow-purple-900/40"
            }`}
          >
            {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
