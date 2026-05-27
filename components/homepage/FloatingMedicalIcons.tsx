"use client";

import {
  Activity,
  HeartPulse,
  Pill,
  ScanBarcode,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";

const icons = [
  {
    Icon: Stethoscope,
    className: "left-[8%] top-[18%] animate-float text-primary/40",
    size: "h-8 w-8",
  },
  {
    Icon: HeartPulse,
    className: "right-[12%] top-[22%] animate-float-delayed text-secondary/35",
    size: "h-10 w-10",
  },
  {
    Icon: Pill,
    className: "left-[15%] bottom-[28%] animate-float text-accent/40",
    size: "h-7 w-7",
    delay: "1s",
  },
  {
    Icon: ScanBarcode,
    className: "right-[18%] bottom-[32%] animate-float-delayed text-primary/30",
    size: "h-8 w-8",
  },
  {
    Icon: Activity,
    className: "left-[45%] top-[8%] animate-float text-secondary/25",
    size: "h-6 w-6",
  },
] as const;

export function FloatingMedicalIcons() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {icons.map(({ Icon, className, size }, i) => (
        <span
          key={i}
          className={cn(
            "absolute rounded-2xl glass p-3 shadow-glass",
            className
          )}
        >
          <Icon className={size} />
        </span>
      ))}
    </div>
  );
}
