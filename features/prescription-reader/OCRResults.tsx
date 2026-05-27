"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Copy,
  FileText,
  Pill,
  ScanLine,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { DetectedMedicineCard } from "@/features/prescription-reader/DetectedMedicineCard";
import { HighlightedOCRText } from "@/features/prescription-reader/HighlightedOCRText";
import { averageMedicineConfidence } from "@/features/prescription-reader/ocr.helpers";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import type { OCRResult } from "@/types/medicine";

interface OCRResultsProps {
  result: OCRResult;
}

export function OCRResults({ result }: OCRResultsProps) {
  const [rawExpanded, setRawExpanded] = useState(true);
  const [copied, setCopied] = useState(false);
  const isDemo = result.source === "demo";
  const isAi = result.source === "openai";
  const avgConfidence = averageMedicineConfidence(result.medicines);

  async function copyRawText() {
    try {
      await navigator.clipboard.writeText(result.rawText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <motion.div
      className="space-y-5"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <section
        className="glass-strong flex flex-col gap-4 rounded-2xl border border-warning/30 bg-warning/5 p-5 sm:flex-row sm:items-start"
        role="alert"
      >
        <ShieldAlert className="h-6 w-6 shrink-0 text-warning" />
        <div>
          <p className="font-semibold text-foreground">
            Verify before taking any medicine
          </p>
          <p className="mt-1 text-sm text-muted">
            OCR can misread handwriting and similar drug names. Confirm every
            entry with your doctor or pharmacist — this is not a verified
            prescription.
          </p>
        </div>
      </section>

      <section className="glass-strong flex flex-col gap-4 rounded-2xl border border-primary/20 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <ProgressRing
            value={avgConfidence}
            max={100}
            size={80}
            label={`${avgConfidence}%`}
            sublabel="Match"
            colorClass="stroke-primary"
          />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Scan complete
            </p>
            <h2 className="text-xl font-bold text-foreground">
              Prescription analysis
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant={result.medicines.length > 0 ? "success" : "outline"}>
                {result.medicines.length} medicine
                {result.medicines.length === 1 ? "" : "s"} detected
              </Badge>
              <Badge variant={isDemo ? "warning" : isAi ? "success" : "default"} className="gap-1">
                <Sparkles className="h-3 w-3" />
                {isDemo ? "Sample text" : isAi ? "Live AI OCR" : "Browser OCR"}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted">
          <ScanLine className="h-4 w-4 text-primary" />
          Highlighted terms match detected medicines
        </div>
      </section>

      {isDemo && (
        <p className="rounded-xl glass border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
          <span className="font-medium">Sample prescription: </span>
          Instant demo — upload a real photo to test live scanning.
        </p>
      )}

      {result.message && (
        <p className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-foreground">
          {result.message}
        </p>
      )}

      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Pill className="h-5 w-5 text-primary" />
            Detected medicines
          </CardTitle>
          <CardDescription>
            Ranked by OCR confidence — always verify with a professional
          </CardDescription>
        </CardHeader>

        {result.medicines.length > 0 ? (
          <ul className="space-y-3">
            {result.medicines.map((med, index) => (
              <li key={`${med.name}-${index}`}>
                <DetectedMedicineCard medicine={med} index={index} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-dashed border-border bg-background/50 px-4 py-8 text-center text-sm text-muted">
            No medicine-like entries detected. Review the highlighted raw text
            below or try a clearer image.
          </p>
        )}
      </Card>

      <Card variant="glass">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-5 w-5 text-primary" />
              Raw OCR text
            </CardTitle>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={copyRawText}
              >
                <Copy className="h-3.5 w-3.5" />
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setRawExpanded((v) => !v)}
              >
                {rawExpanded ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" />
                    Collapse
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" />
                    Expand
                  </>
                )}
              </Button>
            </div>
          </div>
          <CardDescription>
            Medicine names and dosages are highlighted in teal
          </CardDescription>
        </CardHeader>
        <HighlightedOCRText
          text={result.rawText}
          medicines={result.medicines}
          expanded={rawExpanded}
        />
      </Card>

      <p className="flex items-start gap-2 rounded-xl glass border-border/80 px-4 py-3 text-xs leading-relaxed text-muted">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
        Images are processed in your browser only and are not uploaded to a
        server in this demo.
      </p>
    </motion.div>
  );
}
