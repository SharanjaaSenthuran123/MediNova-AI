import { Siren } from "lucide-react";
import { FeatureLoadingCard } from "@/components/ui/FeatureLoadingCard";
import { EcgMonitorStrip } from "@/features/emergency/EcgMonitorStrip";

export function EmergencyAlertLoading() {
  return (
    <div className="space-y-4 animate-fade-in">
      <EcgMonitorStrip />
      <FeatureLoadingCard
        icon={Siren}
        title="Activating SOS simulation"
        subtitle="Recording demo alert with location lock and caretaker notifications…"
        ariaLabel="Activating emergency alert simulation"
        variant="danger"
        steps={["Acquiring GPS lock", "Preparing caretaker alerts", "Starting emergency timeline"]}
      />
    </div>
  );
}
