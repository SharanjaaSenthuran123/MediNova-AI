import { PageHeader } from "@/components/ui/PageHeader";
import { EmergencyClient } from "@/features/emergency/EmergencyClient";

export default function EmergencyPage() {
  return (
    <>
      <PageHeader
        title="Emergency SOS"
        description="Simulated emergency alert with location and caretaker notification."
      />

      <EmergencyClient />
    </>
  );
}
