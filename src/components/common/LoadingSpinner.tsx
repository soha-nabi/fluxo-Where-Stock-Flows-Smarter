import React from "react";
import { RefreshCw } from "lucide-react";

interface LoadingSpinnerProps {
  label?: string;
  className?: string;
}

export function LoadingSpinner({ label = "Loading data...", className = "" }: LoadingSpinnerProps) {
  return (
    <div className={`p-8 text-center text-gray-400 text-xs flex flex-col items-center justify-center gap-3 ${className}`}>
      <RefreshCw className="w-7 h-7 animate-spin text-purple-500" />
      <span>{label}</span>
    </div>
  );
}
