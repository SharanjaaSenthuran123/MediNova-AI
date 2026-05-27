import {
  AlertCircle,
  AlertTriangle,
  Brain,
  PackageSearch,
  ShieldAlert,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { MedicinePreviewCard } from "@/features/barcode-scanner/MedicinePreviewCard";
import { MedicinePhotoAnalysisCard } from "@/features/barcode-scanner/MedicinePhotoAnalysisCard";
import { barcodeSamples } from "@/data/barcodeSamples";
import type { Medicine, MedicineAIInsight, MedicinePhotoAnalysis } from "@/types/medicine";

interface MedicineDetailsProps {
  medicine: Medicine | null;
  barcode: string;
  aiInsight?: MedicineAIInsight | null;
  photoAnalysis?: MedicinePhotoAnalysis | null;
  demoMode?: boolean;
  photoDemoMode?: boolean;
  apiMessage?: string;
  photoMessage?: string;
}

export function MedicineDetails({
  medicine,
  barcode,
  aiInsight,
  photoAnalysis,
  demoMode = true,
  photoDemoMode = true,
  apiMessage,
  photoMessage,
}: MedicineDetailsProps) {
  const hasPhotoAnalysis = Boolean(photoAnalysis);
  const isPhotoOnly = barcode === "photo-analysis";
  const hasBarcodeLookup = Boolean(barcode) && !isPhotoOnly;

  if (!barcode && !hasPhotoAnalysis) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="Medicine analysis appears here"
        description="Upload a photo of your medicine package for AI vision analysis — name, dosage, warnings, and expiry from the label. You can also enter a barcode or try a demo chip."
      />
    );
  }

  if (hasBarcodeLookup && !medicine && !hasPhotoAnalysis) {
    return (
      <div className="space-y-4">
        <Card className="flex min-h-[200px] flex-col items-center justify-center text-center">
          <AlertCircle className="h-10 w-10 text-warning" />
          <h3 className="mt-4 text-lg font-semibold">Medicine not found</h3>
          <p className="mt-2 max-w-sm text-sm text-muted">
            No record for barcode{" "}
            <code className="font-mono text-xs text-foreground">{barcode}</code>.
            Try uploading a photo for AI analysis or use a demo barcode.
          </p>
        </Card>

        <section>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            Known demo barcodes
          </p>
          <ul className="space-y-2 text-sm">
            {barcodeSamples.map((sample) => (
              <li
                key={sample.barcode}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-background/60 px-3 py-2.5"
              >
                <span className="font-medium text-foreground">{sample.label}</span>
                <code className="font-mono text-xs text-muted">{sample.barcode}</code>
              </li>
            ))}
          </ul>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section
        className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-4"
        role="alert"
      >
        <div className="flex gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <div>
            <p className="font-semibold text-foreground">
              Verify before taking any medicine
            </p>
            <p className="mt-1 text-sm text-muted">
              AI photo analysis and database lookups are educational only. Confirm
              every detail with a pharmacist before use.
            </p>
          </div>
        </div>
      </section>

      {(photoMessage || apiMessage) && (
        <p className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
          {photoMessage ?? apiMessage}
        </p>
      )}

      {hasPhotoAnalysis && photoAnalysis && (
        <MedicinePhotoAnalysisCard
          analysis={photoAnalysis}
          liveAi={!photoDemoMode}
        />
      )}

      {medicine && (
        <>
          {hasPhotoAnalysis && (
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
              <Badge variant="success">Database match</Badge>
              Cross-checked with demo medicine database
            </p>
          )}
          <MedicinePreviewCard medicine={medicine} aiLive={!demoMode} />
        </>
      )}

      {hasBarcodeLookup && !medicine && hasPhotoAnalysis && (
        <Card className="border-warning/30 bg-warning/5 px-4 py-3 text-sm text-muted">
          Barcode <code className="font-mono text-foreground">{barcode}</code> was
          detected but is not in the demo database. Photo AI analysis above is still
          available for review.
        </Card>
      )}

      {aiInsight && (
        <Card variant="elevated" className="border-secondary/20">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Brain className="h-4 w-4 text-secondary" />
              AI safety insights
            </p>
            <Badge variant={aiInsight.source === "openai" ? "success" : "outline"}>
              {aiInsight.source === "openai" ? "Live AI" : "Demo AI"}
            </Badge>
          </div>

          <p className="text-sm leading-relaxed text-muted">{aiInsight.safetySummary}</p>

          {aiInsight.interactionTips.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Interaction tips
              </p>
              <ul className="space-y-2">
                {aiInsight.interactionTips.map((tip) => (
                  <li
                    key={tip}
                    className="rounded-lg border border-border/80 bg-background/50 px-3 py-2 text-xs text-foreground"
                  >
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {aiInsight.whenToSeekHelp.length > 0 && (
            <div className="mt-4 rounded-xl border border-danger/30 bg-danger/5 p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-danger">
                <AlertTriangle className="h-3.5 w-3.5" />
                When to seek help
              </p>
              <ul className="list-inside list-disc space-y-1 text-xs text-muted">
                {aiInsight.whenToSeekHelp.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      <p className="flex items-start gap-2 rounded-xl border border-border bg-muted/5 px-4 py-3 text-xs leading-relaxed text-muted">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
        Vision AI reads visible label text — handwriting, glare, or blur may reduce
        accuracy. Always follow your prescriber and pharmacist guidance.
      </p>
    </div>
  );
}
