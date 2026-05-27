import { FeaturePageShell } from "@/components/layout/FeaturePageShell";
import { BarcodeScannerClient } from "@/features/barcode-scanner/BarcodeScannerClient";

export default function BarcodeScannerPage() {
  return (
    <FeaturePageShell
      eyebrow="Medicine Safety"
      title="Smart Medicine Scanner"
        description="Upload a medicine photo for OpenAI Vision analysis — label details, warnings, and expiry. Barcode lookup and manual entry also available."
      disclaimer="Photo analysis uses OpenAI Vision when OPENAI_API_KEY is set. Always verify with a pharmacist."
    >
      <BarcodeScannerClient />
    </FeaturePageShell>
  );
}
