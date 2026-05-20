"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PrescriptionUploader } from "@/features/prescription-reader/PrescriptionUploader";
import { OCRResults } from "@/features/prescription-reader/OCRResults";
import type { OCRResult } from "@/types/medicine";

export function PrescriptionReaderClient() {
  const [result, setResult] = useState<OCRResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section>
        <PrescriptionUploader
          onResult={(data) => {
            setResult(data);
            setError(null);
          }}
          onError={(msg) => {
            setError(msg || null);
          }}
        />
        {error && (
          <p className="mt-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}
      </section>

      <section>
        {result ? (
          <OCRResults result={result} />
        ) : (
          <Card className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FileText className="h-7 w-7" />
            </span>
            <h3 className="mt-4 text-lg font-semibold">OCR results appear here</h3>
            <p className="mt-2 max-w-sm text-sm text-muted">
              Upload a prescription photo and run OCR to see extracted text and
              detected medicine names.
            </p>
          </Card>
        )}
      </section>
    </div>
  );
}
