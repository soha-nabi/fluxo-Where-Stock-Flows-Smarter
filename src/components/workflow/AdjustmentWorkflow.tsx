"use client";

import React from "react";
import { CheckCircle2, Clock, ShieldCheck, Zap, Sliders } from "lucide-react";

interface AdjustmentWorkflowProps {
  currentStatus: string;
  onApprove?: () => void;
  onExecute?: () => void;
  loading?: boolean;
}

export function AdjustmentWorkflow({
  currentStatus = "DRAFT",
  onApprove,
  onExecute,
  loading = false,
}: AdjustmentWorkflowProps) {
  const steps = [
    { key: "DRAFT", label: "Draft Count", icon: Clock },
    { key: "PENDING_APPROVAL", label: "Pending Approval", icon: Clock },
    { key: "APPROVED", label: "Authorized", icon: ShieldCheck },
    { key: "EXECUTED", label: "Ledger Executed", icon: Zap },
  ];

  const currentIdx = steps.findIndex((s) => s.key === currentStatus);

  return (
    <div className="bg-[#121422] border border-[#212438] p-5 rounded-2xl shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-purple-400" /> Stock Audit Adjustment Workflow Stepper
        </h4>

        {(currentStatus === "DRAFT" || currentStatus === "PENDING_APPROVAL") && onApprove && (
          <button onClick={onApprove} disabled={loading} className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs">
            Authorize & Approve
          </button>
        )}
        {currentStatus === "APPROVED" && onExecute && (
          <button onClick={onExecute} disabled={loading} className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs">
            Execute & Post Ledger
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
