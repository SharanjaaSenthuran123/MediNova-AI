import { PageHeader } from "@/components/ui/PageHeader";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { HistoryClient } from "@/features/history/HistoryClient";

export default function HistoryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Records"
        title="Activity history"
        description="Past symptom checks, prescription OCR results, and barcode scans — saved automatically when you have a profile."
      />

      <DisclaimerBanner>
        History is stored in a local demo database for presentation. OCR images are
        never saved — only extracted text previews.
      </DisclaimerBanner>

      <HistoryClient />
    </>
  );
}
