"use client";

import { CheckCircle2, Sparkles } from "lucide-react";
import { DemoModeBanner } from "@/components/ui/DemoModeBanner";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { BarcodeScanner } from "@/features/barcode-scanner/BarcodeScanner";
import { BarcodeLookupLoading } from "@/features/barcode-scanner/BarcodeLookupLoading";
import { MedicineDetails } from "@/features/barcode-scanner/MedicineDetails";
import { useConfigStatus } from "@/hooks/useConfigStatus";
import type { Medicine, MedicineAIInsight, MedicinePhotoAnalysis } from "@/types/medicine";
import { saveBarcodeHistory } from "@/lib/history-client";
import { useCallback, useState } from "react";

export function BarcodeScannerClient() {
  const { status, loading: configLoading } = useConfigStatus();
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState<MedicineAIInsight | null>(null);
  const [photoAnalysis, setPhotoAnalysis] = useState<MedicinePhotoAnalysis | null>(null);
  const [demoMode, setDemoMode] = useState(true);
  const [photoDemoMode, setPhotoDemoMode] = useState(true);
  const [apiMessage, setApiMessage] = useState<string>();
  const [photoMessage, setPhotoMessage] = useState<string>();

  const handleResult = useCallback(
    (
      found: Medicine | null,
      code: string,
      meta?: {
        aiInsight?: MedicineAIInsight | null;
        demoMode?: boolean;
        message?: string;
        photoAnalysis?: MedicinePhotoAnalysis | null;
        photoDemoMode?: boolean;
        photoMessage?: string;
      }
    ) => {
      setMedicine(found);
      setBarcode(code);
      setAiInsight(meta?.aiInsight ?? null);
      setPhotoAnalysis(meta?.photoAnalysis ?? null);
      setDemoMode(meta?.demoMode ?? true);
      setPhotoDemoMode(meta?.photoDemoMode ?? true);
      setApiMessage(meta?.message);
      setPhotoMessage(meta?.photoMessage);
      setError(null);
      if (code && code !== "photo-analysis") {
        void saveBarcodeHistory(code, found);
      }
    },
    []
  );

  const handleLoadingChange = useCallback((next: boolean) => {
    setLoading(next);
    if (next) {
      setMedicine(null);
      setBarcode("");
      setAiInsight(null);
      setPhotoAnalysis(null);
      setApiMessage(undefined);
      setPhotoMessage(undefined);
    }
  }, []);

  const liveAi = status?.liveAi ?? false;

  return (
    <div className="space-y-4">
      {!configLoading && !liveAi && (
        <DemoModeBanner
          message={
            status?.hint ??
            "Add OPENAI_API_KEY to .env.local for live vision AI photo analysis and safety insights."
          }
        />
      )}

      {!configLoading && liveAi && (
        <DisclaimerBanner icon={CheckCircle2} variant="default" className="border-success/30 bg-success/5">
          Live AI connected — medicine photos are analyzed with OpenAI Vision for label
          details, warnings, and safety insights.
        </DisclaimerBanner>
      )}

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <section>
          <BarcodeScanner
            onResult={handleResult}
            onError={(msg) => setError(msg || null)}
            onLoadingChange={handleLoadingChange}
          />
          {error && (
            <p
              className="mt-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
              role="alert"
            >
              {error}
            </p>
          )}
        </section>

        <section aria-live="polite" aria-busy={loading}>
          {loading ? (
            <BarcodeLookupLoading liveAi={liveAi} photoMode />
          ) : (
            <MedicineDetails
              medicine={medicine}
              barcode={barcode}
              aiInsight={aiInsight}
              photoAnalysis={photoAnalysis}
              demoMode={demoMode}
              photoDemoMode={photoDemoMode}
              apiMessage={apiMessage}
              photoMessage={photoMessage}
            />
          )}
        </section>
      </div>

      {!configLoading && !liveAi && (
        <p className="flex items-start gap-2 text-xs text-muted">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-secondary" />
          Quick setup: set <code className="text-foreground">OPENAI_API_KEY=sk-...</code> in{" "}
          <code className="text-foreground">.env.local</code>, then run{" "}
          <code className="text-foreground">npm run dev:reset</code>.
        </p>
      )}
    </div>
  );
}
