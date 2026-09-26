"use client";

import React from "react";
import { CheckCircle2, Clock, Truck, Repeat } from "lucide-react";

interface TransferWorkflowProps {
  currentStatus: string;
  onApprove?: () => void;
  onComplete?: () => void;
  loading?: boolean;
}

export function TransferWorkflow({
  currentStatus = "PENDING",
  onApprove,
  onComplete,
  loading = false,
}: TransferWorkflowProps) {
  const steps = [
    { key: "PENDING", label: "Pending Approval", icon: Clock },
    { key: "IN_TRANSIT", label: "In Transit", icon: Truck },
    { key: "COMPLETED", label: "Completed & Received", icon: CheckCircle2 },
  ];

  const currentIdx = steps.findIndex((s) => s.key === currentStatus);

  return (
    <div className="bg-[#121422] border border-[#212438] p-5 rounded-2xl shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-white flex items-center gap-2">
          <Repeat className="w-4 h-4 text-purple-400" /> Transfer Approval Workflow Stepper
        </h4>

        {currentStatus === "PENDING" && onApprove && (
          <button onClick={onApprove} disabled={loading} className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs">
            Approve & Dispatch
          </button>
        )}
        {currentStatus === "IN_TRANSIT" && onComplete && (
          <button onClick={onComplete} disabled={loading} className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs">
            Complete Transfer
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
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
