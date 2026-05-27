"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  Building2,
  Calendar,
  Pill,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  expiryStatusLabel,
  expiryStatusVariant,
  formatExpiryDate,
  getExpiryStatus,
} from "@/lib/medicine-helpers";
import type { Medicine } from "@/types/medicine";
import { cn } from "@/lib/utils";

interface MedicinePreviewCardProps {
  medicine: Medicine;
  aiLive?: boolean;
  className?: string;
}

export function MedicinePreviewCard({
  medicine,
  aiLive,
  className,
}: MedicinePreviewCardProps) {
  const expiryStatus = getExpiryStatus(medicine.expiry);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={className}
    >
      <Card
        variant="gradient"
        padding="none"
        className="overflow-hidden border-primary/30 shadow-glow-lg"
      >
        <div className="relative border-b border-primary/20 bg-gradient-to-br from-primary/15 via-transparent to-secondary/10 px-5 py-4">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-glow">
                <Pill className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {medicine.name}
                </h3>
                <p className="text-sm text-muted">{medicine.genericName}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant={expiryStatusVariant[expiryStatus]}>
                {expiryStatusLabel[expiryStatus]}
              </Badge>
              {aiLive ? (
                <Badge variant="success">
                  <ShieldCheck className="mr-1 h-3 w-3" />
                  Live AI
                </Badge>
              ) : (
                <Badge variant="outline">Demo AI</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5">
          {medicine.description && (
            <p className="text-sm leading-relaxed text-muted">
              {medicine.description}
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <PreviewField label="Dosage" value={medicine.dosage} />
            <PreviewField
              label="Expires"
              value={formatExpiryDate(medicine.expiry)}
              highlight={
                expiryStatus === "expired"
                  ? "danger"
                  : expiryStatus === "expiring_soon"
                    ? "warning"
                    : undefined
              }
            />
            <PreviewField
              label="Manufacturer"
              value={medicine.manufacturer}
              icon={Building2}
            />
            <PreviewField
              label="Barcode"
              value={medicine.barcode}
              mono
            />
          </div>

          {expiryStatus === "expired" && (
            <div className="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2.5 text-xs text-danger">
              Expired product — do not consume. Dispose safely and consult a
              pharmacist for a replacement.
            </div>
          )}

          {medicine.warnings.length > 0 && (
            <div className="rounded-xl border border-warning/30 bg-warning/10 p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-warning">
                <AlertTriangle className="h-3.5 w-3.5" />
                Safety warnings
              </p>
              <ul className="flex flex-wrap gap-2">
                {medicine.warnings.map((warning) => (
                  <li key={warning}>
                    <Badge
                      variant="warning"
                      className="whitespace-normal text-left leading-snug"
                    >
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

function PreviewField({
  label,
  value,
  icon: Icon,
  mono,
  highlight,
}: {
  label: string;
  value: string;
  icon?: typeof Building2;
  mono?: boolean;
  highlight?: "warning" | "danger";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-background/60 px-3 py-2.5",
        highlight === "danger" && "border-danger/30 bg-danger/5",
        highlight === "warning" && "border-warning/30 bg-warning/5"
      )}
    >
      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
        {Icon && <Icon className="h-3 w-3" />}
        {label === "Expires" && !Icon && <Calendar className="h-3 w-3" />}
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-sm font-medium text-foreground",
          mono && "font-mono text-xs"
        )}
      >
        {value}
      </p>
    </div>
  );
}
