"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Mail,
  MessageSquare,
  Phone,
  Radio,
  ShieldAlert,
  Siren,
  Wifi,
  WifiOff,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import type { EmergencyServiceStatus } from "@/types/emergency";
import { fetchEmergencyServiceStatus } from "@/features/emergency/alert.helpers";
import { cn } from "@/lib/utils";

function StatusRow({
  label,
  state,
  detail,
  icon: Icon,
}: {
  label: string;
  state: "ready" | "simulated" | "offline";
  detail: string;
  icon: typeof Wifi;
}) {
  return (
    <li className="flex items-start gap-3 rounded-lg border border-border bg-background/80 px-3 py-2.5">
      <span
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          state === "ready" && "bg-success/10 text-success",
          state === "simulated" && "bg-warning/10 text-warning",
          state === "offline" && "bg-muted/20 text-muted"
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium">{label}</p>
          <Badge
            variant={
              state === "ready"
                ? "success"
                : state === "simulated"
                  ? "warning"
                  : "secondary"
            }
          >
            {state === "ready"
              ? "Ready"
              : state === "simulated"
                ? "Simulation only"
                : "Offline"}
          </Badge>
        </div>
        <p className="mt-0.5 text-xs text-muted">{detail}</p>
      </div>
    </li>
  );
}

export function EmergencyConnectionPanel() {
  const [status, setStatus] = useState<EmergencyServiceStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmergencyServiceStatus()
      .then(setStatus)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="border-border/80">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Radio className="h-5 w-5 text-primary" />
          SOS service status
        </CardTitle>
        <CardDescription>
          Shows what is really connected vs simulated before you trigger SOS
        </CardDescription>
      </CardHeader>

      {loading ? (
        <p className="px-6 pb-6 text-sm text-muted">Checking API, email, and SMS…</p>
      ) : (
        <ul className="space-y-2 px-6 pb-6">
          <StatusRow
            label="API"
            icon={status?.apiConnected ? Wifi : WifiOff}
            state={status?.apiConnected ? "ready" : "offline"}
            detail={
              status?.apiConnected
                ? status.authenticated
                  ? "Connected — you are logged in"
                  : "Connected — log in for real SMS/email delivery"
                : "Start npm run dev (API on port 4000)"
            }
          />
          <StatusRow
            label="Email (SMTP)"
            icon={Mail}
            state={
              status?.email.ready
                ? "ready"
                : status?.apiConnected
                  ? "simulated"
                  : "offline"
            }
            detail={
              status?.email.ready
                ? "Nodemailer SMTP configured — caretaker/physician emails can send"
                : "Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env.local"
            }
          />
          <StatusRow
            label="SMS (Twilio)"
            icon={MessageSquare}
            state={
              status?.sms.ready
                ? "ready"
                : status?.apiConnected
                  ? "simulated"
                  : "offline"
            }
            detail={
              status?.sms.ready
                ? status.sms.trialNote ?? "Twilio configured — caretaker SMS can send"
                : "Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER in .env.local"
            }
          />
          <StatusRow
            label="Emergency dispatch (911)"
            icon={Siren}
            state="simulated"
            detail="Always simulation only — call 911 or your local emergency number for real emergencies"
          />
        </ul>
      )}

      <div className="border-t border-border px-6 py-3">
        <p className="flex items-start gap-2 text-xs text-muted">
          <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
          Real SMS goes to the primary caretaker when Twilio is configured. Use{" "}
          <code className="text-foreground">EMERGENCY_SMS_TO</code> for Twilio trial testing.
        </p>
      </div>
    </Card>
  );
}
