"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Loader2,
  MapPin,
  Mail,
  MessageSquare,
  Ambulance,
  UserCheck,
  RotateCcw,
} from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SimulatedMap } from "@/features/emergency/SimulatedMap";
import { CaretakerAlertPanel } from "@/features/emergency/CaretakerAlertPanel";
import { EcgMonitorStrip } from "@/features/emergency/EcgMonitorStrip";
import type {
  AlertStep,
  AlertStepStatus,
  EmergencyAlertResult,
  SimulationPhase,
} from "@/types/emergency";
import { cn } from "@/lib/utils";

function buildSteps(result: EmergencyAlertResult): Omit<AlertStep, "status">[] {
  const deliveryDetail = (channel: "sms" | "email" | "push" | "simulated") =>
    result.deliveries?.find((d) => d.channel === channel)?.detail;

  const caretaker = result.notified.find((n) => n.type === "caretaker");
  const physician = result.notified.find((n) => n.type === "physician");
  const dispatch = result.notified.find((n) => n.type === "dispatch");
  const smsDelivery = result.deliveries?.find((d) => d.channel === "sms");
  const emailDelivery = result.deliveries?.find((d) => d.channel === "email");

  return [
    {
      id: "location",
      label: "Detecting location",
      detail: `${result.location.lat.toFixed(4)}, ${result.location.lng.toFixed(4)} — GPS acquired`,
    },
    {
      id: "caretaker",
      label: "Notifying primary caretaker",
      detail:
        smsDelivery?.detail ??
        (caretaker
          ? `${caretaker.name} — ${caretaker.channel.toUpperCase()}`
          : "Primary caretaker alert"),
    },
    {
      id: "ambulance",
      label: "Alerting emergency services",
      detail:
        deliveryDetail("simulated") ??
        (dispatch
          ? `Simulated dispatch to ${dispatch.name}`
          : "Simulated dispatch to nearest facility"),
    },
    {
      id: "email",
      label: "Sending email alert",
      detail:
        emailDelivery?.detail ??
        (physician
          ? `${physician.name} — care team notified`
          : "Care team notified"),
    },
  ];
}

function formatStepTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

interface AlertSimulationProps {
  phase: SimulationPhase;
  result: EmergencyAlertResult | null;
  onComplete?: () => void;
  onReplay?: () => void;
  onStepChange?: (stepId: string | null, status: AlertStepStatus) => void;
}

export function AlertSimulation({
  phase,
  result,
  onComplete,
  onReplay,
  onStepChange,
}: AlertSimulationProps) {
  const stepTemplate = useMemo(
    () => (result ? buildSteps(result) : []),
    [result]
  );

  const [steps, setSteps] = useState<AlertStep[]>([]);
  const [locationReady, setLocationReady] = useState(false);
  const [showRoute, setShowRoute] = useState(false);

  useEffect(() => {
    if (phase !== "running" || !result) {
      if (phase === "complete" && result) {
        const completedAt = new Date();
        setSteps(
          buildSteps(result).map((s, i) => ({
            ...s,
            status: "completed" as AlertStepStatus,
            timestamp: formatStepTime(
              new Date(completedAt.getTime() - (3 - i) * 1200)
            ),
          }))
        );
        setLocationReady(true);
        setShowRoute(true);
        onStepChange?.(null, "completed");
      }
      return;
    }

    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const startTime = Date.now();

    setSteps(stepTemplate.map((s) => ({ ...s, status: "pending" as AlertStepStatus })));
    setLocationReady(false);
    setShowRoute(false);

    function advanceStep(index: number) {
      if (cancelled || index >= stepTemplate.length) {
        onComplete?.();
        return;
      }

      const stepId = stepTemplate[index]?.id ?? null;
      const stepTime = formatStepTime(new Date(startTime + index * 1200));

      setSteps((prev) =>
        prev.map((s, i) => ({
          ...s,
          status: i === index ? "active" : i < index ? "completed" : "pending",
          timestamp: i <= index ? stepTime : s.timestamp,
        }))
      );

      onStepChange?.(stepId, "active");

      if (index === 0) {
        setLocationReady(true);
      }
      if (stepId === "ambulance") {
        setShowRoute(true);
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
              timestamp:
                i <= index
                  ? formatStepTime(new Date(startTime + i * 1200))
                  : s.timestamp,
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
  }, [phase, result, stepTemplate, onComplete, onStepChange]);

  if (phase === "idle" || !result) return null;

  const stepIcons: Record<string, typeof MapPin> = {
    location: MapPin,
    caretaker: UserCheck,
    ambulance: Ambulance,
    email: Mail,
  };

  const allDone = phase === "complete" || steps.every((s) => s.status === "completed");
  const caretakerStep = steps.find((s) => s.id === "caretaker");
  const caretakerName =
    result.notified.find((n) => n.type === "caretaker")?.name ?? "Primary caretaker";
  const locationAcquiring =
    steps.find((s) => s.id === "location")?.status === "active";

  return (
    <div className="space-y-4 animate-fade-in">
      <EcgMonitorStrip active={!allDone} />

      {locationReady && (
        <SimulatedMap
          location={result.location}
          showRoute={showRoute}
          acquiring={locationAcquiring}
          className="timeline-step-enter"
        />
      )}

      {caretakerStep && caretakerStep.status !== "pending" && (
        <CaretakerAlertPanel
          caretakerName={caretakerName}
          status={caretakerStep.status}
          address={result.location.address}
        />
      )}

      <Card className="overflow-hidden border-danger/20">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base">Emergency timeline</CardTitle>
            <Badge variant={allDone ? "success" : "danger"}>
              {allDone ? "Simulation complete" : "Alert in progress"}
            </Badge>
          </div>
          <CardDescription>
            Demo workflow — no real SMS, email, or emergency dispatch
          </CardDescription>
        </CardHeader>

        <ol className="relative space-y-0 px-1 pb-2">
          <div
            className="absolute bottom-4 left-[1.15rem] top-4 w-0.5 bg-border"
            aria-hidden
          />

          {steps.map((step, index) => {
            const Icon = stepIcons[step.id] ?? MessageSquare;
            return (
              <li
                key={step.id}
                className={cn(
                  "relative flex gap-3 pb-5 last:pb-0 timeline-step-enter",
                  step.status === "active" && "rounded-lg bg-danger/5 px-2 py-2 -mx-2"
                )}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <span
                  className={cn(
                    "relative z-10 mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-background transition-all duration-300",
                    step.status === "completed" && "bg-success/15 text-success shadow-sm",
                    step.status === "active" &&
                      "bg-danger/15 text-danger shadow-md ring-4 ring-danger/15",
                    step.status === "pending" && "bg-muted/10 text-muted"
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
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="flex flex-wrap items-center gap-2 font-medium">
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        step.status === "active" ? "text-danger" : "text-muted"
                      )}
                    />
                    {step.label}
                    {step.timestamp && (
                      <span className="font-mono text-xs font-normal text-muted">
                        {step.timestamp}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted">{step.detail}</p>
                </div>
              </li>
            );
          })}
        </ol>

        {allDone && onReplay && (
          <div className="mt-2 border-t border-border px-6 pb-6 pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onReplay}
              className="w-full sm:w-auto"
            >
              <RotateCcw className="h-4 w-4" />
              Replay simulation
            </Button>
          </div>
        )}
      </Card>

      {allDone && (
        <Card className="border-success/30 bg-success/5 timeline-step-enter">
          <CardHeader>
            <CardTitle className="text-base">Notifications summary</CardTitle>
            <CardDescription>{result.message}</CardDescription>
          </CardHeader>
          <ul className="space-y-2 px-6 pb-6 text-sm">
            {result.notified.map((contact, index) => (
              <li
                key={`${contact.name}-${contact.channel}-${index}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2"
              >
                <span className="font-medium text-foreground">{contact.name}</span>
                <Badge variant="outline" className="capitalize">
                  {contact.channel}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
