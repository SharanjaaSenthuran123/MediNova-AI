import { PageHeader } from "@/components/ui/PageHeader";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { RemindersClient } from "@/features/reminders/RemindersClient";

export default function RemindersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Adherence"
        title="Medicine Reminders"
        description="Smart schedules from prescription OCR and barcode scans — push and email alerts are simulated in this demo."
      />

      <DisclaimerBanner>
        Reminders are for demo purposes. Always follow your prescriber&apos;s
        directions and verify medicines with a pharmacist.
      </DisclaimerBanner>

      <RemindersClient />
    </>
  );
}
