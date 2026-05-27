"use client";

import { cn } from "@/lib/utils";

interface BarcodeScanOverlayProps {
  progress?: number;
  stageLabel?: string;
  flashlightOn?: boolean;
  className?: string;
}

export function BarcodeScanOverlay({
  progress = 0,
  stageLabel,
  flashlightOn,
  className,
}: BarcodeScanOverlayProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
      aria-hidden
    >
      <div
        className={cn(
          "absolute inset-0 ocr-scan-grid transition-opacity duration-300",
          flashlightOn ? "bg-amber-400/10 opacity-100" : "bg-primary/5 opacity-80"
        )}
      />

      <span className="ocr-corner-bracket left-3 top-3 border-l-2 border-t-2" />
      <span className="ocr-corner-bracket right-3 top-3 border-r-2 border-t-2" />
      <span className="ocr-corner-bracket bottom-3 left-3 border-b-2 border-l-2" />
      <span className="ocr-corner-bracket bottom-3 right-3 border-b-2 border-r-2" />

      <div className="absolute inset-x-6 top-1/2 h-px -translate-y-1/2 bg-primary/20" />
      <div className="absolute inset-x-8 top-1/2 h-8 -translate-y-1/2 rounded-lg border border-primary/30 barcode-scan-frame" />

      <div
        className={cn(
          "absolute inset-x-6 top-0 h-0.5 barcode-scan-beam bg-gradient-to-r from-transparent via-primary to-transparent",
          flashlightOn &&
            "via-amber-300 shadow-[0_0_16px_rgb(251_191_36_/_0.9)]"
        )}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-primary/10 animate-pulse-slow" />

      <div className="absolute left-1/2 top-3 flex -translate-x-1/2 items-center gap-1.5 rounded-full glass-strong px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-primary">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        MediScan
      </div>

      {(progress > 0 || stageLabel) && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full glass-strong px-3 py-1.5 text-xs font-medium shadow-glow">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          {stageLabel ?? "Analyzing barcode…"}
          {progress > 0 && (
            <span className="text-primary tabular-nums">{progress}%</span>
          )}
        </div>
      )}
    </div>
  );
}
