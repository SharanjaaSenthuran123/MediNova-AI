"use client";

import { useCallback, useEffect, useState } from "react";
import { ShieldAlert, Siren } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { EmergencyCard } from "@/components/healthcare/EmergencyCard";
import { SOSButton } from "@/features/emergency/SOSButton";
import { AlertSimulation } from "@/features/emergency/AlertSimulation";
import { EmergencyAlertLoading } from "@/features/emergency/EmergencyAlertLoading";
import { EmergencyDemoChips } from "@/features/emergency/EmergencyDemoChips";
import { EmergencyStatusBar } from "@/features/emergency/EmergencyStatusBar";
import { EmergencyConnectionPanel } from "@/features/emergency/EmergencyConnectionPanel";
import { EmergencyDeliverySummary } from "@/features/emergency/EmergencyDeliverySummary";
import { EcgMonitorStrip } from "@/features/emergency/EcgMonitorStrip";
import { triggerEmergencyAlert } from "@/features/emergency/alert.helpers";
import { emergencyContacts } from "@/data/emergencyContacts";
import {
  requestNotificationPermission,
  showEmergencyNotification,
} from "@/lib/geolocation";
import type {
  AlertStepStatus,
  EmergencyAlertResult,
  SimulationPhase,
} from "@/types/emergency";
import { cn } from "@/lib/utils";

export function EmergencyClient() {
  const [phase, setPhase] = useState<SimulationPhase>("idle");
  const [alertResult, setAlertResult] = useState<EmergencyAlertResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [instantMode, setInstantMode] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  useEffect(() => {
    void requestNotificationPermission();
  }, []);

  const busy = phase === "loading" || phase === "running";
  const isEmergencyActive = phase !== "idle";

  const runAlert = useCallback(async () => {
    setPhase("loading");
    setError(null);
    setAlertResult(null);
    setActiveStepId(null);
    setShowFlash(true);
    setStartedAt(Date.now());
    window.setTimeout(() => setShowFlash(false), 800);

    try {
      const result = await triggerEmergencyAlert();
      setAlertResult(result);
      setPhase("running");
    } catch {
      setError("Alert simulation failed. Please try again.");
      setPhase("idle");
      setInstantMode(false);
      setActiveScenario(null);
      setStartedAt(null);
    }
  }, []);

  function handleActivate() {
    runAlert();
  }

  function handleScenarioSelect(skipCountdown: boolean) {
    setActiveScenario(skipCountdown ? "quick" : "standard");
    setInstantMode(skipCountdown);
    if (skipCountdown) {
      runAlert();
    }
  }

  function handleReplay() {
    setPhase("idle");
    setAlertResult(null);
    setInstantMode(false);
    setActiveScenario(null);
    setActiveStepId(null);
    setError(null);
    setStartedAt(null);
  }

  function handleSimulationComplete() {
    setPhase("complete");
    setInstantMode(false);
    setActiveStepId(null);
    showEmergencyNotification(
      "MediNova SOS Simulation Complete",
      "Caretaker and care team alerts simulated. For real emergencies, call your local emergency number."
    );
  }

  function handleStepChange(stepId: string | null, _status: AlertStepStatus) {
    setActiveStepId(stepId);
  }

  const caretakerName = emergencyContacts[0]?.name;
  const hospitalName = emergencyContacts[2]?.name;

  return (
    <div
      className={cn(
        "relative space-y-6",
        isEmergencyActive && "emergency-active-shell rounded-2xl p-1"
      )}
    >
      {showFlash && (
        <div
          className="pointer-events-none fixed inset-0 z-50 bg-danger/25 emergency-flash-overlay"
          aria-hidden
        />
      )}

      <EmergencyStatusBar
        phase={phase}
        startedAt={startedAt}
        simulation={alertResult?.simulation ?? true}
        hasRealDelivery={alertResult?.deliveries?.some((d) => d.status === "sent")}
      />

      <EmergencyConnectionPanel />

      <p className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <span>
          <strong>911 dispatch is always simulated.</strong> SMS and email send
          for real when Twilio/SMTP are configured and you are logged in. For real
          emergencies, call your local emergency number immediately.
        </span>
      </p>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <section className="space-y-6">
          <Card
            className={cn(
              "flex flex-col items-center justify-center py-10 transition-all duration-500",
              busy && "border-danger/30 bg-danger/[0.03]",
              phase === "complete" && "border-success/25 bg-success/[0.03]"
            )}
          >
            <SOSButton
              onActivate={handleActivate}
              disabled={busy || phase === "complete"}
              instant={instantMode && phase === "loading"}
              emergencyActive={busy}
            />

            <div className="mt-6 w-full max-w-sm px-4">
              <EmergencyDemoChips
                onSelect={handleScenarioSelect}
                disabled={busy || phase === "complete"}
                activeId={activeScenario}
              />
            </div>

            {busy && (
              <div className="mt-6 w-full max-w-sm px-4">
                <EcgMonitorStrip />
              </div>
            )}
          </Card>

          <section>
            <h3 className="mb-3 text-base font-semibold">Emergency contacts</h3>
            <ul className="space-y-3">
              {emergencyContacts.map((contact) => (
                <li key={contact.name}>
                  <EmergencyCard
                    contact={contact}
                    notified={alertResult?.notified}
                    notifying={
                      activeStepId === "caretaker" &&
                      phase === "running" &&
                      contact.name === caretakerName
                    }
                    dispatching={
                      activeStepId === "ambulance" &&
                      phase === "running" &&
                      contact.name === hospitalName
                    }
                  />
                </li>
              ))}
            </ul>
          </section>
        </section>

        <section aria-live="polite" aria-busy={busy}>
          {phase === "loading" && <EmergencyAlertLoading />}

          {phase === "idle" && (
            <EmptyState
              icon={Siren}
              title="Alert timeline appears here"
              description="Tap the SOS button for a dramatic 5-second countdown with ripple effects, or choose Quick demo for an instant presentation flow with live map, caretaker alerts, and dispatch simulation."
              className="border-dashed"
            />
          )}

          {(phase === "running" || phase === "complete") && alertResult && (
            <>
              <AlertSimulation
                phase={phase}
                result={alertResult}
                onComplete={handleSimulationComplete}
                onReplay={handleReplay}
                onStepChange={handleStepChange}
              />
              {phase === "complete" && alertResult.deliveries?.length > 0 && (
                <EmergencyDeliverySummary
                  deliveries={alertResult.deliveries}
                  simulation={alertResult.simulation}
                  authenticated={alertResult.authenticated}
                />
              )}
            </>
          )}

          {error && (
            <p
              className="mt-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
              role="alert"
            >
              {error}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
