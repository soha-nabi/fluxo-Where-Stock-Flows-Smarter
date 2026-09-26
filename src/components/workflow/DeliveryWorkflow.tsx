"use client";

import React from "react";
import { CheckCircle2, Clock, Layers, Box, Truck } from "lucide-react";

interface DeliveryWorkflowProps {
  currentStatus: string;
  onPick?: () => void;
  onPack?: () => void;
  onShip?: () => void;
  loading?: boolean;
}

export function DeliveryWorkflow({
  currentStatus = "DRAFT",
  onPick,
  onPack,
  onShip,
  loading = false,
}: DeliveryWorkflowProps) {
  const steps = [
    { key: "DRAFT", label: "Draft Order", icon: Clock },
    { key: "PICKED", label: "Pick Items", icon: Layers },
    { key: "PACKED", label: "Pack Parcel", icon: Box },
    { key: "SHIPPED", label: "Ship & Dispatch", icon: Truck },
  ];

  const currentIdx = steps.findIndex((s) => s.key === (currentStatus === "PICKING" ? "DRAFT" : currentStatus === "DELIVERED" ? "SHIPPED" : currentStatus));

  return (
    <div className="bg-[#121422] border border-[#212438] p-5 rounded-2xl shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-purple-400" /> Delivery Fulfillment Stepper
        </h4>

        {(currentStatus === "DRAFT" || currentStatus === "PICKING") && onPick && (
          <button onClick={onPick} disabled={loading} className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs">
            Pick Items
          </button>
        )}
        {(currentStatus === "PICKED" || currentStatus === "PICKING") && onPack && (
          <button onClick={onPack} disabled={loading} className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs">
            Pack Parcel
          </button>
        )}
        {currentStatus === "PACKED" && onShip && (
          <button onClick={onShip} disabled={loading} className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs">
            Ship Delivery
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
