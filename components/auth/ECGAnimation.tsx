"use client";

import { motion } from "framer-motion";

export function ECGAnimation() {
  return (
    <div className="relative h-16 w-full overflow-hidden rounded-xl glass px-4 py-3">
      <div className="mb-1 flex items-center justify-between text-xs text-muted">
        <span>Live ECG Monitor</span>
        <span className="flex items-center gap-1 text-success">
          <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
          72 bpm
        </span>
      </div>
      <svg
        viewBox="0 0 400 40"
        className="h-8 w-full"
        preserveAspectRatio="none"
        aria-hidden
      >
        <motion.path
          d="M0 20 L20 20 L25 20 L30 8 L35 32 L40 20 L60 20 L65 20 L70 12 L75 28 L80 20 L100 20 L105 20 L110 5 L115 35 L120 20 L140 20 L145 20 L150 15 L155 25 L160 20 L180 20 L185 20 L190 10 L195 30 L200 20 L220 20 L225 20 L230 18 L235 22 L240 20 L260 20 L265 20 L270 6 L275 34 L280 20 L300 20 L305 20 L310 14 L315 26 L320 20 L340 20 L345 20 L350 12 L355 28 L360 20 L380 20 L400 20"
          fill="none"
          stroke="url(#ecgGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0.5 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <defs>
          <linearGradient id="ecgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
