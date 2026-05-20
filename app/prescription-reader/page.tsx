import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { PrescriptionReaderClient } from "@/features/prescription-reader/PrescriptionReaderClient";

export default function PrescriptionReaderPage() {
  return (
    <>
      <PageHeader
        title="Prescription OCR Reader"
        description="Upload prescription images and extract medicine names with Tesseract.js."
      />

      <p className="mb-6 flex items-start gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        OCR runs in your browser. Always verify extracted medicines with a
        pharmacist or doctor.
      </p>

      <PrescriptionReaderClient />
    </>
  );
}
