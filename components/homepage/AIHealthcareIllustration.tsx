"use client";

import { Brain, HeartPulse, Sparkles } from "lucide-react";

/** Precomputed orbit nodes — avoids SSR/client float drift from Math.cos/sin. */
const ORBIT_NODES = [
  { x: "265", y: "160", lineDelay: "0s", circleDelay: "0s" },
  { x: "192.45", y: "259.86", lineDelay: "0.2s", circleDelay: "0.15s" },
  { x: "75.05", y: "221.76", lineDelay: "0.4s", circleDelay: "0.3s" },
  { x: "75.05", y: "98.24", lineDelay: "0.6s", circleDelay: "0.45s" },
  { x: "192.45", y: "60.14", lineDelay: "0.8s", circleDelay: "0.6s" },
] as const;

/** Central AI + healthcare hub illustration for the hero. */
export function AIHealthcareIllustration() {
  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[340px]"
      aria-hidden
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 blur-2xl animate-glow" />

      <svg
        viewBox="0 0 320 320"
        className="relative h-full w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="160"
          cy="160"
          r="120"
          stroke="url(#orbitGrad)"
          strokeWidth="1"
          strokeDasharray="4 8"
          className="animate-orbit-slow origin-center"
          style={{ transformOrigin: "160px 160px" }}
        />
        <circle
          cx="160"
          cy="160"
          r="90"
          stroke="rgb(20 184 166 / 0.25)"
          strokeWidth="1"
          strokeDasharray="2 6"
          className="animate-orbit-reverse origin-center"
          style={{ transformOrigin: "160px 160px" }}
        />

        {ORBIT_NODES.map((node, i) => (
            <g key={i}>
              <line
                x1="160"
                y1="160"
                x2={node.x}
                y2={node.y}
                stroke="rgb(20 184 166 / 0.2)"
                strokeWidth="1"
                className="animate-pulse-slow"
                style={{ animationDelay: node.lineDelay }}
              />
              <circle
                cx={node.x}
                cy={node.y}
                r="6"
                fill="rgb(20 184 166 / 0.5)"
                className="animate-pulse-slow"
                style={{ animationDelay: node.circleDelay }}
              />
            </g>
          ))}

        <defs>
          <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary via-accent to-secondary p-[2px] shadow-glow-lg animate-float">
          <div className="flex h-full w-full items-center justify-center rounded-full glass-strong">
            <Brain className="h-10 w-10 text-primary" />
          </div>
          <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-white shadow-md">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs font-medium text-primary">
          <HeartPulse className="h-3.5 w-3.5 animate-pulse-slow" />
          AI Health Engine
        </div>
      </div>
    </div>
  );
}
