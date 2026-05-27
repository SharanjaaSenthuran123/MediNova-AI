import { FeaturePageShell } from "@/components/layout/FeaturePageShell";
import { PrescriptionReaderClient } from "@/features/prescription-reader/PrescriptionReaderClient";

export default function PrescriptionReaderPage() {
  return (
    <FeaturePageShell
      eyebrow="OCR Tools"
      title="Prescription OCR Reader"
      description="Upload a prescription photo or try a sample — Tesseract.js runs OCR in your browser and highlights possible medicines with verification warnings."
      disclaimer="OCR runs in your browser. Always verify extracted medicines with a pharmacist or doctor."
    >
      <PrescriptionReaderClient />
    </FeaturePageShell>
  );
}
