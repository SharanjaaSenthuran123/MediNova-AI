"use client";

import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmergencyCard } from "@/components/healthcare/EmergencyCard";
import { SOSButton } from "@/features/emergency/SOSButton";
import { AlertSimulation } from "@/features/emergency/AlertSimulation";
import { emergencyContacts } from "@/data/emergencyContacts";

export function EmergencyClient() {
  const [alertActive, setAlertActive] = useState(false);
  const [alertSent, setAlertSent] = useState(false);

  function handleActivate() {
    setAlertActive(true);
    setAlertSent(true);
  }

  function handleReset() {
    setAlertActive(false);
    setAlertSent(false);
  }

  return (
    <div className="space-y-6">
      <p className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <span>
          <strong>Simulation only.</strong> This demo does not contact real
          emergency services, send SMS, or email. For real emergencies, call your
          local emergency number immediately.
        </span>
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col items-center justify-center py-10">
          <SOSButton onActivate={handleActivate} disabled={alertActive} />
          {alertSent && !alertActive && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-6"
              onClick={handleReset}
            >
              Reset simulation
            </Button>
          )}
        </Card>

        <section>
          <h3 className="mb-3 text-base font-semibold">Emergency contacts</h3>
          <ul className="space-y-3">
            {emergencyContacts.map((contact) => (
              <li key={contact.name}>
                <EmergencyCard contact={contact} />
              </li>
            ))}
          </ul>
        </section>
      </div>

      <AlertSimulation
        active={alertActive}
        onComplete={() => setAlertActive(false)}
      />
    </div>
  );
}
