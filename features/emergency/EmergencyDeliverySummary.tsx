import {
  CheckCircle2,
  Mail,
  MessageSquare,
  MinusCircle,
  Phone,
  Siren,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import type { ChannelDelivery, DeliveryStatus } from "@/types/emergency";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  DeliveryStatus,
  { label: string; variant: "success" | "warning" | "danger" | "secondary"; icon: typeof CheckCircle2 }
> = {
  sent: { label: "Sent", variant: "success", icon: CheckCircle2 },
  failed: { label: "Failed", variant: "danger", icon: XCircle },
  skipped: { label: "Not configured", variant: "secondary", icon: MinusCircle },
  simulated: { label: "Simulation only", variant: "warning", icon: Siren },
};

const channelIcons = {
  sms: MessageSquare,
  email: Mail,
  push: Phone,
  simulated: Siren,
};

interface EmergencyDeliverySummaryProps {
  deliveries: ChannelDelivery[];
  simulation: boolean;
  authenticated: boolean;
}

export function EmergencyDeliverySummary({
  deliveries,
  simulation,
  authenticated,
}: EmergencyDeliverySummaryProps) {
  return (
    <Card
      className={cn(
        simulation ? "border-warning/30 bg-warning/5" : "border-success/30 bg-success/5"
      )}
    >
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">Delivery report</CardTitle>
          <Badge variant={simulation ? "warning" : "success"}>
            {simulation ? "Simulation / partial" : "Real alerts sent"}
          </Badge>
        </div>
        <CardDescription>
          {authenticated
            ? "Actual backend results for each notification channel"
            : "Log in and configure Twilio/SMTP for real delivery"}
        </CardDescription>
      </CardHeader>

      <ul className="space-y-2 px-6 pb-6">
        {deliveries.map((item, index) => {
          const config = statusConfig[item.status];
          const StatusIcon = config.icon;
          const ChannelIcon = channelIcons[item.channel];

          return (
            <li
              key={`${item.channel}-${item.contactName}-${index}`}
              className="rounded-lg border border-border bg-background px-3 py-2.5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ChannelIcon className="h-4 w-4 text-muted" />
                  <span className="text-sm font-medium capitalize">
                    {item.channel}
                    {item.contactName ? ` · ${item.contactName}` : ""}
                  </span>
                </div>
                <Badge variant={config.variant} className="gap-1">
                  <StatusIcon className="h-3 w-3" />
                  {config.label}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted">{item.detail}</p>
              {item.recipient && (
                <p className="mt-1 font-mono text-[10px] text-muted">
                  → {item.recipient}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
