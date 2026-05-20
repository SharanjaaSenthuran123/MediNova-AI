import { AlertTriangle, CheckCircle, Info, Siren } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { UrgencyLevel } from "@/types/symptom";
import { cn } from "@/lib/utils";

const config: Record<
  UrgencyLevel,
  { label: string; variant: "success" | "warning" | "danger" | "default"; icon: typeof Info }
> = {
  low: { label: "Low urgency", variant: "success", icon: CheckCircle },
  moderate: { label: "Moderate urgency", variant: "warning", icon: Info },
  high: { label: "High urgency", variant: "danger", icon: AlertTriangle },
  emergency: { label: "Emergency", variant: "danger", icon: Siren },
};

interface RiskBadgeProps {
  urgency: UrgencyLevel;
  className?: string;
}

export function RiskBadge({ urgency, className }: RiskBadgeProps) {
  const { label, variant, icon: Icon } = config[urgency];

  return (
    <Badge variant={variant} className={cn("gap-1.5", className)}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Badge>
  );
}
