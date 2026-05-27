"use client";

import { cn } from "@/lib/utils";

interface OCRScanOverlayProps {
  progress?: number;
  stageLabel?: string;
  className?: string;
}

export function OCRScanOverlay({
  progress = 0,
  stageLabel,
  className,
}: OCRScanOverlayProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden rounded-xl",
        className
      )}
      aria-hidden
    >
      <div className="absolute inset-0 bg-primary/5 ocr-scan-grid" />

      <span className="ocr-corner-bracket left-2 top-2 border-l-2 border-t-2" />
      <span className="ocr-corner-bracket right-2 top-2 border-r-2 border-t-2" />
      <span className="ocr-corner-bracket bottom-2 left-2 border-b-2 border-l-2" />
      <span className="ocr-corner-bracket bottom-2 right-2 border-b-2 border-r-2" />

      <div className="absolute inset-x-4 top-0 h-0.5 ocr-scan-line bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_12px_rgb(20_184_166_/_0.8)]" />

      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-primary/10 animate-pulse-slow" />

      {(progress > 0 || stageLabel) && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full glass-strong px-3 py-1.5 text-xs font-medium shadow-glow">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          {stageLabel ?? "Scanning…"}
          {progress > 0 && (
            <span className="text-primary">{progress}%</span>
          )}
        </div>
      )}
    </div>
  );
}
