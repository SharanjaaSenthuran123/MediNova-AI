"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Loader2,
  MapPin,
  Mail,
  MessageSquare,
  Ambulance,
  UserCheck,
} from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { demoLocation } from "@/data/emergencyContacts";
import type { AlertStep, AlertStepStatus } from "@/types/emergency";
import { cn } from "@/lib/utils";

const INITIAL_STEPS: Omit<AlertStep, "status">[] = [
  {
    id: "location",
    label: "Detecting location",
    detail: "GPS coordinates acquired",
  },
  {
    id: "caretaker",
    label: "Notifying primary caretaker",
    detail: "Sarah Johnson — SMS & push notification",
  },
  {
    id: "ambulance",
    label: "Alerting emergency services",
    detail: "Simulated dispatch to nearest facility",
  },
  {
    id: "email",
    label: "Sending email alert",
    detail: "Dr. Michael Chen — care team notified",
  },
];

interface AlertSimulationProps {
  active: boolean;
  onComplete?: () => void;
}

export function AlertSimulation({ active, onComplete }: AlertSimulationProps) {
  const [steps, setSteps] = useState<AlertStep[]>(
    INITIAL_STEPS.map((s) => ({ ...s, status: "pending" as AlertStepStatus }))
  );
  const [locationReady, setLocationReady] = useState(false);

  useEffect(() => {
    if (!active) {
      setSteps(
        INITIAL_STEPS.map((s) => ({ ...s, status: "pending" as AlertStepStatus }))
      );
      setLocationReady(false);
      return;
    }

    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    function advanceStep(index: number) {
      if (cancelled || index >= INITIAL_STEPS.length) {
        onComplete?.();
        return;
      }

      setSteps((prev) =>
        prev.map((s, i) => ({
          ...s,
          status: i === index ? "active" : i < index ? "completed" : "pending",
        }))
      );

      if (index === 0) {
        setLocationReady(true);
      }

      timeouts.push(
        setTimeout(() => {
          setSteps((prev) =>
            prev.map((s, i) => ({
              ...s,
              status:
                i <= index
                  ? "completed"
                  : i === index + 1
                    ? "active"
                    : "pending",
            }))
          );
          advanceStep(index + 1);
        }, 1200)
      );
    }

    advanceStep(0);

    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, [active, onComplete]);

  if (!active) return null;

  const stepIcons: Record<string, typeof MapPin> = {
    location: MapPin,
    caretaker: UserCheck,
    ambulance: Ambulance,
    email: Mail,
  };

  const allDone = steps.every((s) => s.status === "completed");

  return (
    <div className="space-y-4">
      {locationReady && (
        <Card className="border-danger/30 bg-danger/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-5 w-5 text-danger" />
              Simulated location
            </CardTitle>
            <CardDescription>{demoLocation.address}</CardDescription>
          </CardHeader>
          <p className="text-xs text-muted">
            {demoLocation.lat.toFixed(4)}, {demoLocation.lng.toFixed(4)}
          </p>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base">Alert timeline</CardTitle>
            <Badge variant={allDone ? "success" : "danger"}>
              {allDone ? "Simulation complete" : "Alert in progress"}
            </Badge>
          </div>
          <CardDescription>
            Demo workflow — no real SMS, email, or emergency dispatch
          </CardDescription>
        </CardHeader>

        <ol className="space-y-4">
          {steps.map((step) => {
            const Icon = stepIcons[step.id] ?? MessageSquare;
            return (
              <li key={step.id} className="flex gap-3">
                <span
                  className={cn(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    step.status === "completed" && "bg-success/10 text-success",
                    step.status === "active" && "bg-danger/10 text-danger",
                    step.status === "pending" && "bg-border text-muted"
                  )}
                >
                  {step.status === "completed" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : step.status === "active" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-medium">
                    <Icon className="h-4 w-4 shrink-0 text-muted" />
                    {step.label}
                  </p>
                  <p className="text-sm text-muted">{step.detail}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </Card>
    </div>
  );
}
