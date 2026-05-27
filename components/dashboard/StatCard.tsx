import {
  Activity,
  Droplets,
  HeartPulse,
  Moon,
  Pill,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { HealthStat } from "@/types/health";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  HeartPulse,
  Moon,
  Pill,
  Activity,
  Droplets,
};

const statusVariant = {
  normal: "success" as const,
  improving: "default" as const,
  attention: "warning" as const,
  critical: "danger" as const,
};

const statusLabel = {
  normal: "Normal",
  improving: "Improving",
  attention: "Needs attention",
  critical: "Critical",
};

interface StatCardProps {
  stat: HealthStat;
  className?: string;
}

export function StatCard({ stat, className }: StatCardProps) {
  const Icon = iconMap[stat.icon] ?? Activity;

  return (
    <Card interactive className={cn("group", className)}>
      <section className="flex items-start justify-between">
        <section className="gradient-icon flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110">
          <Icon className="h-5 w-5" />
        </section>
        <Badge variant={statusVariant[stat.status]}>
          {statusLabel[stat.status]}
        </Badge>
      </section>
      <p className="mt-4 text-sm text-muted">{stat.label}</p>
      <p className="mt-1 text-3xl font-bold text-foreground">
        {stat.value}
        {stat.unit && (
          <span className="ml-1 text-lg font-medium text-muted">{stat.unit}</span>
        )}
      </p>
      {stat.change && (
        <p className="mt-2 text-xs text-muted">{stat.change}</p>
      )}
    </Card>
  );
}
