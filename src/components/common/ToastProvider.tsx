"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { toastVariants } from "@/styles/animations";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextValue {
  showToast: (title: string, type?: ToastType, description?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
  removeToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (title: string, type: ToastType = "info", description?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { id, type, title, description };

    setToasts((prev) => [...prev, newToast]);

    // Auto-disappear after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-400 shrink-0" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-purple-400 shrink-0" />;
    }
  };

  const getToastBorder = (type: ToastType) => {
    switch (type) {
      case "success":
        return "border-emerald-800/60 bg-emerald-950/80 text-emerald-100";
      case "error":
        return "border-red-800/60 bg-red-950/80 text-red-100";
      case "warning":
        return "border-amber-800/60 bg-amber-950/80 text-amber-100";
      default:
        return "border-purple-800/60 bg-purple-950/80 text-purple-100";
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}

      {/* Floating Toast Portal Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              variants={toastVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`p-4 rounded-2xl border backdrop-blur-xl shadow-2xl pointer-events-auto flex items-start justify-between gap-3 ${getToastBorder(
                toast.type
              )}`}
            >
              <div className="flex items-start gap-3">
                {getToastIcon(toast.type)}
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold leading-tight">{toast.title}</h4>
                  {toast.description && (
                    <p className="text-[11px] text-gray-300 leading-snug">{toast.description}</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
