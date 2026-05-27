import { PageHeader } from "@/components/ui/PageHeader";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { AppointmentsClient } from "@/features/appointments/AppointmentsClient";

export default function AppointmentsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Care access"
        title="Doctor Appointments"
        description="Book virtual or in-person visits with prep checklists — demo UI without real calendar integration."
      />

      <DisclaimerBanner>
        Appointment booking is simulated for presentation. Production would
        connect to clinic scheduling APIs (e.g. FHIR, Zocdoc, or EHR portals).
      </DisclaimerBanner>

      <AppointmentsClient />
    </>
  );
}
