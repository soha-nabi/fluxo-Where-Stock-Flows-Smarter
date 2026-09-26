"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV === "development") {
      console.error("[ErrorBoundary caught error]:", error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-8 rounded-2xl bg-red-950/30 border border-red-800/50 text-red-300 text-xs flex flex-col items-center gap-3 text-center my-4">
          <AlertTriangle className="w-8 h-8 text-red-400" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Component Error Occurred</h4>
            <p className="text-red-300 max-w-md">{this.state.error?.message || "An unexpected rendering error occurred."}</p>
          </div>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 rounded-xl bg-red-900/80 hover:bg-red-800 text-white font-bold text-xs flex items-center gap-2 border border-red-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
