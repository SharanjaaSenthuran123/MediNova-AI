import { Siren } from "lucide-react";
import { FeaturePageShell } from "@/components/layout/FeaturePageShell";
import { EmergencyClient } from "@/features/emergency/EmergencyClient";

export default function EmergencyPage() {
  return (
    <FeaturePageShell
      eyebrow="Safety"
      title="Emergency SOS"
      description="Realistic emergency healthcare simulation — animated SOS, live map, caretaker alerts, dispatch timeline, and replayable demo flow."
      disclaimerIcon={Siren}
      disclaimerVariant="danger"
      disclaimer="Simulation only — this does not contact real emergency services, send SMS, or email. For real emergencies, call your local emergency number immediately."
    >
      <EmergencyClient />
    </FeaturePageShell>
  );
}
