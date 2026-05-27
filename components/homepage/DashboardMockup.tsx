import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardMockupProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

/** Browser-style frame for dashboard preview content. */
export function DashboardMockup({
  children,
  title = "MediNova Dashboard",
  className,
}: DashboardMockupProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-white/30 shadow-glass-lg dark:border-white/10",
        className
      )}
    >
      <div className="flex items-center gap-3 border-b border-white/20 bg-white/30 px-4 py-3 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-3 w-3 rounded-full bg-danger/80" />
          <span className="h-3 w-3 rounded-full bg-warning/80" />
          <span className="h-3 w-3 rounded-full bg-success/80" />
        </div>
        <div className="flex-1 rounded-lg border border-white/20 bg-white/40 px-3 py-1 text-center text-xs text-muted dark:border-white/10 dark:bg-white/5">
          {title}
        </div>
        <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success">
          Live demo
        </span>
      </div>
      <div className="glass-strong p-4 sm:p-5">{children}</div>
    </div>
  );
}
