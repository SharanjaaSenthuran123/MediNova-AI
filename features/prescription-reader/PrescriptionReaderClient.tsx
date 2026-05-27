"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { PrescriptionUploader } from "@/features/prescription-reader/PrescriptionUploader";
import { OCRResults } from "@/features/prescription-reader/OCRResults";
import { OCRAnalysisLoading } from "@/features/prescription-reader/OCRAnalysisLoading";
import type { OCRResult } from "@/types/medicine";
import type { OCRProgressState } from "@/features/prescription-reader/ocr.helpers";
import { savePrescriptionHistory } from "@/lib/history-client";

const defaultProgress: OCRProgressState = {
  progress: 0,
  stage: "idle",
  stageLabel: "Ready to scan",
};

export function PrescriptionReaderClient() {
  const [result, setResult] = useState<OCRResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progressState, setProgressState] =
    useState<OCRProgressState>(defaultProgress);

  function handleResult(data: OCRResult) {
    setResult(data);
    setError(null);
    void savePrescriptionHistory(data);
  }

  function handleLoadingChange(next: boolean) {
    setLoading(next);
    if (next) {
      setResult(null);
      setProgressState(defaultProgress);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <section>
        <PrescriptionUploader
          onResult={handleResult}
          onError={(msg) => setError(msg || null)}
          onLoadingChange={handleLoadingChange}
          onProgressChange={setProgressState}
        />
        {error && (
          <p
            className="mt-3 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
            role="alert"
          >
            {error}
          </p>
        )}
      </section>

      <section aria-live="polite" aria-busy={loading}>
        {loading ? (
          <OCRAnalysisLoading
            progress={progressState.progress}
            stage={progressState.stage}
            stageLabel={progressState.stageLabel}
          />
        ) : result ? (
          <OCRResults result={result} />
        ) : (
          <EmptyState
            icon={FileText}
            title="Scan results appear here"
            description="Drag & drop a prescription photo, tap Start OCR scan, or try a sample chip. Detected medicines will be highlighted with confidence scores."
            className="glass-strong border-primary/10"
          />
        )}
      </section>
    </div>
  );
}
