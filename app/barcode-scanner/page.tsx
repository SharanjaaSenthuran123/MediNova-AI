import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { BarcodeScannerClient } from "@/features/barcode-scanner/BarcodeScannerClient";

export default function BarcodeScannerPage() {
  return (
    <>
      <PageHeader
        title="Medicine Barcode Scanner"
        description="Scan barcodes to view medicine details, dosage, warnings, and expiry."
      />

      <p className="mb-6 flex items-start gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        Demo mode uses mock medicine data. Camera access is optional — manual
        barcode entry is always available.
      </p>

      <BarcodeScannerClient />
    </>
  );
}
