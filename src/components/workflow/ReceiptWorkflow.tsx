"use client";

import React from "react";
import { CheckCircle2, Clock, Boxes, ShieldCheck, Zap } from "lucide-react";

interface ReceiptWorkflowProps {
  currentStatus: string;
  onReceive?: () => void;
  onValidate?: () => void;
  onComplete?: () => void;
  loading?: boolean;
}

export function ReceiptWorkflow({
  currentStatus = "DRAFT",
  onReceive,
  onValidate,
  onComplete,
  loading = false,
}: ReceiptWorkflowProps) {
  const steps = [
    { key: "DRAFT", label: "Step 1: Create Receipt", icon: Clock },
    { key: "RECEIVED", label: "Step 2: Receive Items", icon: Boxes },
    { key: "VALIDATED", label: "Step 3: Quality Validate", icon: ShieldCheck },
    { key: "COMPLETED", label: "Step 4: Update Ledger", icon: Zap },
  ];

  const currentIdx = steps.findIndex((s) => s.key === currentStatus);

  return (
    <div className="bg-[#121422] border border-[#212438] p-5 rounded-2xl shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-purple-400" /> Goods Receipt Workflow Stepper
        </h4>

        {currentStatus === "DRAFT" && onReceive && (
          <button onClick={onReceive} disabled={loading} className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs">
            Receive Items
          </button>
        )}
        {currentStatus === "RECEIVED" && onValidate && (
          <button onClick={onValidate} disabled={loading} className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs">
            Validate Inspection
          </button>
        )}
        {currentStatus === "VALIDATED" && onComplete && (
          <button onClick={onComplete} disabled={loading} className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs">
            Post Stock Ledger
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = currentIdx >= idx;
          const isCurrent = currentIdx === idx;

          return (
            <div
              key={step.key}
              className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                isCurrent
                  ? "bg-purple-950/60 border-purple-500 text-purple-200 shadow-lg shadow-purple-900/30"
                  : isDone
                  ? "bg-emerald-950/40 border-emerald-800/50 text-emerald-300"
                  : "bg-[#16182a] border-[#22253d] text-gray-500"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-mono uppercase font-bold">{step.key}</span>
                <span className="font-bold text-[11px] truncate">{step.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
