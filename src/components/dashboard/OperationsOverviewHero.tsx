"use me";
"use client";

import React, { useEffect, useState } from "react";
import {
  Sun,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Repeat,
  Sliders,
  Globe,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Database,
} from "lucide-react";
import { MOCK_HERO_DATA, MOCK_OPERATIONS_SUMMARY } from "@/data/mockData";
import { fetchDashboardMetrics, DashboardMetrics } from "@/lib/api";

export function OperationsOverviewHero() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    fetchDashboardMetrics()
      .then((data) => setMetrics(data))
      .catch((err) => console.log("Falling back to local cache", err));
  }, []);

  const hero = metrics
    ? {
        greeting: metrics.greeting,
        headlineBold: metrics.headlineBold,
        headlineAccent: metrics.headlineAccent,
        subtitle: metrics.subtitle,
        totalWarehouses: metrics.totalWarehouses,
      }
    : MOCK_HERO_DATA;

  const opsSummary = metrics ? metrics.operationsSummary : MOCK_OPERATIONS_SUMMARY;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121422] via-[#0d0e18] to-[#090a10] border border-[#1e2030] p-6 lg:p-8 shadow-2xl space-y-8">
      {/* Background ambient lighting glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Hero Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left Column: Massive Typography & Action Buttons */}
        <div className="lg:col-span-6 space-y-5">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>{hero.greeting}</span>
            </div>
            {metrics && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Database className="w-3 h-3 text-emerald-400" />
                POSTGRES LIVE
              </span>
            )}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
            {hero.headlineBold}{" "}
            <span className="bg-gradient-to-r from-[#a855f7] via-[#c084fc] to-[#e879f9] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(168,85,247,0.5)]">
              {hero.headlineAccent}
            </span>
          </h1>

          <p className="text-sm sm:text-base text-gray-400 max-w-lg leading-relaxed font-sans">
            {hero.subtitle}
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button className="px-5 py-2.5 rounded-2xl bg-white text-black font-semibold text-xs hover:bg-gray-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.25)] flex items-center gap-2 active:scale-95">
              <Plus className="w-4 h-4" />
              <span>Create Operation</span>
            </button>
            <button className="px-5 py-2.5 rounded-2xl bg-[#181a28] border border-[#2b2e45] text-white font-medium text-xs hover:bg-[#202336] transition-all">
              View Reports
            </button>
          </div>
        </div>

        {/* Right Column: 3D Isometric Warehouse Network Visualizer */}
        <div className="lg:col-span-6 relative min-h-[260px] sm:min-h-[300px] rounded-2xl bg-[#0a0b12]/60 border border-[#1d2033] p-4 overflow-hidden flex items-center justify-center">
          {/* Top Right Connected Status Pill */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#141626]/90 border border-[#262a42] text-xs font-mono text-gray-200 backdrop-blur-md shadow-xl">
            <Globe className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span className="font-bold text-white">{hero.totalWarehouses}</span>
            <span className="text-gray-400">Warehouses Connected</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>

          {/* SVG Animated Supply-Chain Network Diagram */}
          <svg className="w-full h-full absolute inset-0 pointer-events-none" viewBox="0 0 500 280">
            <defs>
              <linearGradient id="arcGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#7c3aed" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            <path
              d="M 120 180 Q 250 80 380 150"
              fill="none"
              stroke="url(#arcGlow)"
              strokeWidth="2.5"
              strokeDasharray="6 6"
              className="animate-pulse"
            />
            <path
              d="M 250 80 Q 300 200 380 150"
              fill="none"
              stroke="url(#arcGlow)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* Platforms */}
            <g transform="translate(110, 170)">
              <polygon points="0,-15 35,0 0,15 -35,0" fill="#1e2038" stroke="#7c3aed" strokeWidth="1.5" opacity="0.9" />
              <polygon points="0,0 35,15 0,30 -35,15" fill="#14162a" stroke="#7c3aed" strokeWidth="1" opacity="0.8" />
            </g>

            <g transform="translate(250, 75)">
              <polygon points="0,-22 50,0 0,22 -50,0" fill="#2d1b4e" stroke="#c084fc" strokeWidth="2" />
              <polygon points="0,0 50,22 0,44 -50,22" fill="#1e1236" stroke="#c084fc" strokeWidth="1.5" />
            </g>

            <g transform="translate(380, 145)">
              <polygon points="0,-18 40,0 0,18 -40,0" fill="#1a233d" stroke="#38bdf8" strokeWidth="1.5" />
              <polygon points="0,0 40,18 0,36 -40,18" fill="#10172a" stroke="#38bdf8" strokeWidth="1" />
            </g>
          </svg>

          {/* Node Tags */}
          <div className="absolute left-[18%] bottom-[25%] z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#141626]/90 border border-[#7c3aed]/50 text-xs shadow-[0_0_15px_rgba(124,58,237,0.3)] backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <div className="flex flex-col">
              <span className="font-bold text-white leading-none">Reno</span>
              <span className="text-[10px] text-gray-400 font-mono">4,212 SKUs</span>
            </div>
          </div>

          <div className="absolute top-[16%] left-[42%] z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1e1338]/90 border border-[#c084fc] text-xs shadow-[0_0_20px_rgba(192,132,252,0.5)] backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div className="flex flex-col">
              <span className="font-extrabold text-white leading-none flex items-center gap-1">
                Austin
                <Sparkles className="w-3 h-3 text-purple-300" />
              </span>
              <span className="text-[10px] text-purple-200 font-mono font-bold">7,858 SKUs</span>
            </div>
          </div>

          <div className="absolute right-[12%] bottom-[35%] z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#10192e]/90 border border-[#38bdf8]/50 text-xs shadow-[0_0_15px_rgba(56,189,248,0.3)] backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <div className="flex flex-col">
              <span className="font-bold text-white leading-none">Dallas</span>
              <span className="text-[10px] text-gray-400 font-mono">2,750 SKUs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Minimal Operations Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#1e2030]">
        {opsSummary.map((op, idx) => {
          return (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-[#0c0d16] border border-[#1c1e2e] flex items-center gap-3.5 hover:border-[#2d314a] transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#161826] border border-[#272a42] flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                {op.iconType === "incoming" && <ArrowDownLeft className="w-5 h-5 text-purple-400" />}
                {op.iconType === "outgoing" && <ArrowUpRight className="w-5 h-5 text-indigo-400" />}
                {op.iconType === "transfer" && <Repeat className="w-5 h-5 text-purple-300" />}
                {op.iconType === "adjustment" && <Sliders className="w-5 h-5 text-amber-400" />}
              </div>

              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-medium">{op.label}</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-white font-mono">{op.count}</span>
                  <span
                    className={`text-[10px] font-mono font-semibold flex items-center ${
                      op.isPositive ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {op.isPositive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                    {op.change}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
