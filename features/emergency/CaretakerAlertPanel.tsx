"use client";

import { Bell, MessageSquare, Smartphone } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { AlertStepStatus } from "@/types/emergency";
import { cn } from "@/lib/utils";

interface CaretakerAlertPanelProps {
  caretakerName: string;
  status: AlertStepStatus;
  address: string;
}

export function CaretakerAlertPanel({
  caretakerName,
  status,
  address,
}: CaretakerAlertPanelProps) {
  if (status === "pending") return null;

  const isActive = status === "active";
  const isDone = status === "completed";

  return (
    <Card
      className={cn(
        "overflow-hidden border-warning/35 bg-warning/5",
        (isActive || isDone) && "caretaker-alert-slide"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Smartphone className="h-5 w-5 text-warning" />
            Caretaker alerts
          </CardTitle>
          <Badge variant={isDone ? "success" : "warning"}>
            {isDone ? "Delivered (simulated)" : "Sending…"}
          </Badge>
        </div>
        <CardDescription>
          Simulated SMS and push to {caretakerName}
        </CardDescription>
      </CardHeader>

      <div className="space-y-3 px-6 pb-6">
        <div
          className={cn(
            "rounded-2xl rounded-bl-md border border-border bg-background p-3 shadow-sm",
            isActive && "ring-2 ring-warning/30"
          )}
        >
          <div className="mb-2 flex items-center gap-2 text-xs text-muted">
            <MessageSquare className="h-3.5 w-3.5" />
            SMS · {caretakerName}
          </div>
          <p className="text-sm font-medium text-foreground">
            🚨 SOS ALERT — MediNova patient needs help
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Location shared: {address}. This is a demo simulation — no real
            message was sent.
          </p>
        </div>

        <div
          className={cn(
            "flex items-start gap-3 rounded-xl border border-border bg-background p-3 shadow-sm",
            isDone && "border-success/30"
          )}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-danger/10 text-danger">
            <Bell className={cn("h-4 w-4", isActive && "animate-pulse")} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold">MediNova Emergency</p>
            <p className="text-xs text-muted">
              Push notification · {isDone ? "Opened" : "Delivering…"}
            </p>
            <p className="mt-1 text-xs text-foreground">
              Tap to view live location and care instructions (simulated).
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
