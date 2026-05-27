import { AlertTriangle, Building2, Calendar, Pill } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  expiryStatusLabel,
  expiryStatusVariant,
  formatExpiryDate,
  getExpiryStatus,
} from "@/lib/medicine-helpers";
import type { Medicine } from "@/types/medicine";

interface MedicineCardProps {
  medicine: Medicine | { name: string; dosage?: string; warnings?: string[] };
  variant?: "full" | "compact";
}

export function MedicineCard({ medicine, variant = "full" }: MedicineCardProps) {
  const isFull = variant === "full" && "barcode" in medicine;
  const expiryStatus =
    isFull && medicine.expiry ? getExpiryStatus(medicine.expiry) : null;

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Pill className="h-5 w-5 text-primary" />
            {medicine.name}
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {expiryStatus && (
              <Badge variant={expiryStatusVariant[expiryStatus]}>
                {expiryStatusLabel[expiryStatus]}
              </Badge>
            )}
            {isFull && <Badge variant="outline">Verified lookup</Badge>}
          </div>
        </div>
        {isFull && (
          <CardDescription>{medicine.genericName}</CardDescription>
        )}
      </CardHeader>

      <div className="space-y-3 text-sm">
        {medicine.dosage && (
          <p>
            <span className="font-medium text-foreground">Dosage: </span>
            <span className="text-muted">{medicine.dosage}</span>
          </p>
        )}

        {isFull && medicine.description && (
          <p className="text-muted">{medicine.description}</p>
        )}

        {isFull && (
          <>
            <p className="flex items-center gap-2 text-muted">
              <Building2 className="h-4 w-4 shrink-0" />
              {medicine.manufacturer}
            </p>
            <p className="flex items-center gap-2 text-muted">
              <Calendar className="h-4 w-4 shrink-0" />
              Expires {formatExpiryDate(medicine.expiry)}
            </p>
            {expiryStatus === "expired" && (
              <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
                This product is past its expiry date. Do not use expired
                products — dispose safely and consult a pharmacist.
              </p>
            )}
            {expiryStatus === "expiring_soon" && (
              <p className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-foreground">
                Expiring within 60 days. Check your stock and refill if needed.
              </p>
            )}
          </>
        )}

        {medicine.warnings && medicine.warnings.length > 0 && (
          <div className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2">
            <p className="flex items-center gap-1.5 text-xs font-medium text-warning">
              <AlertTriangle className="h-3.5 w-3.5" />
              Warnings
            </p>
            <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs text-muted">
              {medicine.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}
