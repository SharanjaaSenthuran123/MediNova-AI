import { AlertTriangle, Building2, Calendar, Pill } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Medicine } from "@/types/medicine";

interface MedicineCardProps {
  medicine: Medicine | { name: string; dosage?: string; warnings?: string[] };
  variant?: "full" | "compact";
}

export function MedicineCard({ medicine, variant = "full" }: MedicineCardProps) {
  const isFull = variant === "full" && "barcode" in medicine;

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Pill className="h-5 w-5 text-primary" />
            {medicine.name}
          </CardTitle>
          {isFull && (
            <Badge variant="outline">Demo data</Badge>
          )}
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

        {isFull && (
          <>
            <p className="flex items-center gap-2 text-muted">
              <Building2 className="h-4 w-4 shrink-0" />
              {medicine.manufacturer}
            </p>
            <p className="flex items-center gap-2 text-muted">
              <Calendar className="h-4 w-4 shrink-0" />
              Expires {medicine.expiry}
            </p>
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
