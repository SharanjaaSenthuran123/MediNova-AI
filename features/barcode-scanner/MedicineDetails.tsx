import { AlertCircle, PackageSearch } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { MedicineCard } from "@/components/healthcare/MedicineCard";
import type { Medicine } from "@/types/medicine";

interface MedicineDetailsProps {
  medicine: Medicine | null;
  barcode: string;
}

export function MedicineDetails({ medicine, barcode }: MedicineDetailsProps) {
  if (!barcode) {
    return (
      <Card className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <PackageSearch className="h-7 w-7" />
        </span>
        <h3 className="mt-4 text-lg font-semibold">Scan or enter a barcode</h3>
        <p className="mt-2 max-w-sm text-sm text-muted">
          Medicine details including dosage, warnings, expiry, and manufacturer
          will appear here.
        </p>
      </Card>
    );
  }

  if (!medicine) {
    return (
      <Card className="flex h-full min-h-[200px] flex-col items-center justify-center text-center">
        <AlertCircle className="h-10 w-10 text-warning" />
        <h3 className="mt-4 text-lg font-semibold">Medicine not found</h3>
        <p className="mt-2 max-w-sm text-sm text-muted">
          No mock record for barcode <code className="text-xs">{barcode}</code>.
          Try a demo code from the hint below the manual input.
        </p>
      </Card>
    );
  }

  return <MedicineCard medicine={medicine} variant="full" />;
}
