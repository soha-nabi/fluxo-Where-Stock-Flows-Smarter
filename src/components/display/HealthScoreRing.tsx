import React from "react";

interface HealthScoreRingProps {
  score: number;
  statusText?: string;
  size?: number;
  strokeWidth?: number;
}

export function HealthScoreRing({
  score = 95,
  statusText = "Healthy",
  size = 120,
  strokeWidth = 8,
}: HealthScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1f2238"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#neonPurpleGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="neonPurpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-extrabold font-mono text-white tracking-tighter drop-shadow-[0_0_12px_rgba(168,85,247,0.6)]">
            {score}%
          </span>
        </div>
      </div>
      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{statusText}</span>
    </div>
  );
}
