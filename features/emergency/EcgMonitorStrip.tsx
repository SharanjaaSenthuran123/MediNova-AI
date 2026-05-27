import { cn } from "@/lib/utils";

interface EcgMonitorStripProps {
  active?: boolean;
  className?: string;
}

export function EcgMonitorStrip({ active = true, className }: EcgMonitorStripProps) {
  if (!active) return null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-danger/25 bg-slate-950/90 px-3 py-2",
        className
      )}
      aria-hidden
    >
      <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-wider text-danger/80">
        <span>Vital monitor</span>
        <span className="emergency-status-pulse font-semibold text-danger">● LIVE</span>
      </div>
      <svg
        viewBox="0 0 400 48"
        className="h-10 w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label="Simulated ECG heartbeat"
      >
        <defs>
          <linearGradient id="ecg-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(239 68 68 / 0.2)" />
            <stop offset="50%" stopColor="rgb(239 68 68 / 0.9)" />
            <stop offset="100%" stopColor="rgb(239 68 68 / 0.2)" />
          </linearGradient>
        </defs>
        <path
          d="M0 24 L40 24 L48 24 L56 8 L64 40 L72 24 L120 24 L128 24 L136 16 L144 32 L152 24 L200 24 L208 24 L216 6 L224 42 L232 24 L280 24 L288 24 L296 18 L304 30 L312 24 L360 24 L400 24"
          fill="none"
          stroke="url(#ecg-gradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ecg-line-path"
        />
      </svg>
    </div>
  );
}
