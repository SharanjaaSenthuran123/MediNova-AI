import {
  CheckCircle2,
  Lock,
  ShieldCheck,
  Smartphone,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { trustBadges } from "@/data/homepageFeatures";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  ShieldCheck,
  Sparkles,
  Lock,
  Smartphone,
  CheckCircle2,
};

interface TrustBadgesProps {
  className?: string;
  compact?: boolean;
}

export function TrustBadges({ className, compact = false }: TrustBadgesProps) {
  return (
    <ul
      className={cn(
        "flex flex-wrap gap-2",
        compact ? "gap-1.5" : "gap-2",
        className
      )}
      aria-label="Trust and safety badges"
    >
      {trustBadges.map((badge) => {
        const Icon = iconMap[badge.icon] ?? ShieldCheck;
        return (
          <li key={badge.label}>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/40 font-medium backdrop-blur-md dark:border-white/10 dark:bg-white/5",
                compact
                  ? "px-2.5 py-1 text-[11px] text-muted"
                  : "px-3 py-1.5 text-xs text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "shrink-0 text-primary",
                  compact ? "h-3 w-3" : "h-3.5 w-3.5"
                )}
                aria-hidden
              />
              {badge.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
