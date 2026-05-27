"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Pill } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { DetectedMedicine, MedicineConfidence } from "@/types/medicine";
import { cn } from "@/lib/utils";

interface DetectedMedicineCardProps {
  medicine: DetectedMedicine;
  index: number;
}

const confidenceConfig: Record<
  MedicineConfidence,
  { label: string; variant: "success" | "warning" | "outline"; ring: string }
> = {
  high: {
    label: "High confidence",
    variant: "success",
    ring: "from-success/40 via-primary/30 to-success/20",
  },
  medium: {
    label: "Medium confidence",
    variant: "warning",
    ring: "from-warning/40 via-primary/20 to-warning/10",
  },
  low: {
    label: "Low confidence",
    variant: "outline",
    ring: "from-muted/40 via-border to-muted/20",
  },
};

export function DetectedMedicineCard({
  medicine,
  index,
}: DetectedMedicineCardProps) {
  const config = confidenceConfig[medicine.confidence];

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
      className="feature-card-border rounded-2xl"
    >
      <div className="glass-strong rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/15 text-sm font-bold text-primary shadow-sm">
            {index + 1}
          </span>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <Pill className="h-4 w-4 text-primary" />
                {medicine.name}
              </h4>
              <Badge variant={config.variant}>{config.label}</Badge>
            </div>

            <p className="text-sm text-muted">
              <span className="font-medium text-foreground">Dosage: </span>
              {medicine.dosageHint ?? "Unclear — confirm with pharmacist"}
            </p>

            <p className="flex items-start gap-1.5 rounded-lg border border-warning/20 bg-warning/5 px-3 py-2 text-xs text-muted">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
              OCR-detected only. Verify spelling and strength before use.
            </p>
          </div>
        </div>

        <div
          className={cn(
            "mt-3 h-1 rounded-full bg-gradient-to-r opacity-80",
            config.ring
          )}
          aria-hidden
        />
      </div>
    </motion.article>
  );
}
