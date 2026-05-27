"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  Brain,
  Building2,
  Calendar,
  Package,
  ScanBarcode,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { MedicinePhotoAnalysis } from "@/types/medicine";
import { cn } from "@/lib/utils";

const confidenceVariant = {
  high: "success",
  medium: "warning",
  low: "outline",
} as const;

const confidenceLabel = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
} as const;

interface MedicinePhotoAnalysisCardProps {
  analysis: MedicinePhotoAnalysis;
  liveAi?: boolean;
  className?: string;
}

export function MedicinePhotoAnalysisCard({
  analysis,
  liveAi,
  className,
}: MedicinePhotoAnalysisCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={className}
    >
      <Card variant="gradient" padding="none" className="overflow-hidden border-secondary/30 shadow-glow-lg">
        <div className="border-b border-secondary/20 bg-gradient-to-br from-secondary/15 via-transparent to-primary/10 px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary/15 text-secondary shadow-glow">
                <Brain className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Photo AI analysis
                </p>
                <h3 className="text-lg font-semibold text-foreground">
                  {analysis.medicineName}
                </h3>
                {analysis.genericName && (
                  <p className="text-sm text-muted">{analysis.genericName}</p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant={confidenceVariant[analysis.confidence]}>
                {confidenceLabel[analysis.confidence]}
              </Badge>
              <Badge variant={liveAi ? "success" : "outline"}>
                {liveAi ? "Live Vision AI" : "Demo Vision AI"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <p className="text-sm leading-relaxed text-muted">{analysis.description}</p>

          <div className="grid gap-3 sm:grid-cols-2">
            {analysis.dosage && (
              <Field label="Dosage" value={analysis.dosage} />
            )}
            {analysis.expiry && (
              <Field label="Expiry (from label)" value={analysis.expiry} icon={Calendar} />
            )}
            {analysis.manufacturer && (
              <Field label="Manufacturer" value={analysis.manufacturer} icon={Building2} />
            )}
            {analysis.barcode && (
              <Field label="Barcode (from label)" value={analysis.barcode} icon={ScanBarcode} mono />
            )}
            {analysis.batchNumber && (
              <Field label="Batch" value={analysis.batchNumber} icon={Package} mono />
            )}
          </div>

          {analysis.labelNotes.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Label notes
              </p>
              <ul className="space-y-1.5">
                {analysis.labelNotes.map((note) => (
                  <li
                    key={note}
                    className="rounded-lg border border-border/80 bg-background/50 px-3 py-2 text-xs text-foreground"
                  >
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.warnings.length > 0 && (
            <div className="rounded-xl border border-warning/30 bg-warning/10 p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-warning">
                <AlertTriangle className="h-3.5 w-3.5" />
                Detected warnings
              </p>
              <ul className="flex flex-wrap gap-2">
                {analysis.warnings.map((warning) => (
                  <li key={warning}>
                    <Badge variant="warning" className="whitespace-normal text-left leading-snug">
                      {warning}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

function Field({
  label,
  value,
  icon: Icon,
  mono,
}: {
  label: string;
  value: string;
  icon?: typeof Calendar;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border/80 bg-background/60 px-3 py-2.5">
      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </p>
      <p className={cn("mt-1 text-sm font-medium text-foreground", mono && "font-mono text-xs")}>
        {value}
      </p>
    </div>
  );
}
