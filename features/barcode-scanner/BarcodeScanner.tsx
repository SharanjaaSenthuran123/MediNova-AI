"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Flashlight, FlashlightOff, ScanBarcode, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { analyzeMedicinePhoto } from "@/features/barcode-scanner/analyze-photo.helpers";
import { BarcodeSampleChips } from "@/features/barcode-scanner/BarcodeSampleChips";
import { BarcodePhotoUpload } from "@/features/barcode-scanner/BarcodePhotoUpload";
import { BarcodeScanOverlay } from "@/features/barcode-scanner/BarcodeScanOverlay";
import { lookupMedicineBarcode } from "@/features/barcode-scanner/lookup.helpers";
import {
  scanBarcodeFromImage,
  validateBarcodePhoto,
} from "@/lib/barcode-image";
import type {
  Medicine,
  MedicineAIInsight,
  MedicinePhotoAnalysis,
} from "@/types/medicine";
import { cn } from "@/lib/utils";

const SCAN_STAGES = [
  "Analyzing package with vision AI",
  "Reading label text",
  "Matching medicine database",
  "Generating safety insights",
] as const;

interface BarcodeScannerProps {
  onResult: (
    medicine: Medicine | null,
    barcode: string,
    meta?: {
      aiInsight?: MedicineAIInsight | null;
      demoMode?: boolean;
      message?: string;
      photoAnalysis?: MedicinePhotoAnalysis | null;
      photoDemoMode?: boolean;
      photoMessage?: string;
    }
  ) => void;
  onError: (message: string) => void;
  onLoadingChange?: (loading: boolean) => void;
}

export function BarcodeScanner({
  onResult,
  onError,
  onLoadingChange,
}: BarcodeScannerProps) {
  const [manualCode, setManualCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStage, setScanStage] = useState<string>(SCAN_STAGES[0]);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [lastLookup, setLastLookup] = useState<string | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  const clearProgressTimer = useCallback(() => {
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
  }, []);

  const revokePreview = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPhotoPreviewUrl(null);
  }, []);

  const setLoadingState = useCallback(
    (next: boolean) => {
      onLoadingChange?.(next);
    },
    [onLoadingChange]
  );

  const startProgress = useCallback(
    (from = 8) => {
      let stageIndex = 0;
      setScanProgress(from);
      setScanStage(SCAN_STAGES[0]);
      clearProgressTimer();
      progressTimer.current = setInterval(() => {
        setScanProgress((p) => Math.min(p + 5, 90));
        stageIndex = Math.min(stageIndex + 1, SCAN_STAGES.length - 1);
        setScanStage(SCAN_STAGES[stageIndex]);
      }, 480);
    },
    [clearProgressTimer]
  );

  const finishProgress = useCallback(() => {
    clearProgressTimer();
    setScanProgress(100);
    setScanStage("Analysis complete");
    setTimeout(() => {
      setScanning(false);
      setAnalyzingPhoto(false);
      setScanProgress(0);
      setLoadingState(false);
    }, 400);
  }, [clearProgressTimer, setLoadingState]);

  const runLookup = useCallback(
    async (
      code: string,
      extras?: {
        photoAnalysis?: MedicinePhotoAnalysis | null;
        photoDemoMode?: boolean;
        photoMessage?: string;
      }
    ) => {
      const trimmed = code.trim();
      if (!trimmed || scanning) return;

      onError("");
      setLastLookup(trimmed);
      setScanning(true);
      setLoadingState(true);
      startProgress(extras?.photoAnalysis ? 55 : 8);

      try {
        const result = await lookupMedicineBarcode(trimmed);
        onResult(result.medicine, result.barcode, {
          aiInsight: result.aiInsight,
          demoMode: result.demoMode,
          message: result.message,
          photoAnalysis: extras?.photoAnalysis,
          photoDemoMode: extras?.photoDemoMode,
          photoMessage: extras?.photoMessage,
        });
      } catch {
        onError("Lookup failed. Check the barcode and try again.");
      } finally {
        finishProgress();
      }
    },
    [scanning, onResult, onError, setLoadingState, startProgress, finishProgress]
  );

  const handlePhotoSelect = useCallback(
    async (file: File) => {
      if (scanning || analyzingPhoto) return;

      const validationError = validateBarcodePhoto(file);
      if (validationError) {
        onError(validationError);
        return;
      }

      onError("");
      revokePreview();

      const url = URL.createObjectURL(file);
      previewUrlRef.current = url;
      setPhotoPreviewUrl(url);

      setAnalyzingPhoto(true);
      setScanning(true);
      setLoadingState(true);
      startProgress(10);

      try {
        const photoPromise = analyzeMedicinePhoto(file);
        const barcodePromise = scanBarcodeFromImage(file).catch(() => null);

        const [photoResult, zxingBarcode] = await Promise.all([
          photoPromise,
          barcodePromise,
        ]);

        setScanProgress(70);
        setScanStage(SCAN_STAGES[2]);

        const analysis = photoResult.analysis;
        const barcode =
          zxingBarcode?.trim() ||
          photoResult.barcode?.trim() ||
          analysis.barcode?.trim() ||
          "";

        if (barcode) {
          setManualCode(barcode);
        }

        let lookup = null;
        if (barcode) {
          try {
            lookup = await lookupMedicineBarcode(barcode);
          } catch {
            /* lookup optional when photo analysis succeeded */
          }
        }

        const dbMedicine =
          photoResult.databaseMatch ?? lookup?.medicine ?? null;

        onResult(dbMedicine, barcode || "photo-analysis", {
          aiInsight: lookup?.aiInsight ?? null,
          demoMode: lookup?.demoMode ?? true,
          message: lookup?.message ?? photoResult.message,
          photoAnalysis: analysis,
          photoDemoMode: photoResult.demoMode,
          photoMessage: photoResult.message,
        });
      } catch {
        onError(
          "Could not analyze that photo. Use a clear, well-lit image of the medicine label or box."
        );
        setAnalyzingPhoto(false);
        setScanning(false);
        setScanProgress(0);
        setLoadingState(false);
        clearProgressTimer();
        return;
      }

      finishProgress();
    },
    [
      scanning,
      analyzingPhoto,
      onError,
      revokePreview,
      setLoadingState,
      startProgress,
      finishProgress,
      onResult,
      clearProgressTimer,
    ]
  );

  const handleClearPhoto = useCallback(() => {
    revokePreview();
    setAnalyzingPhoto(false);
    setScanProgress(0);
  }, [revokePreview]);

  const busy = scanning || analyzingPhoto;
  const showOverlay = busy;

  useEffect(() => {
    return () => {
      clearProgressTimer();
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, [clearProgressTimer]);

  return (
    <Card variant="elevated" padding="none" className="overflow-hidden">
      <div className="border-b border-border/60 px-4 py-3 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              MediScan Analyzer
            </p>
            <p className="mt-0.5 text-xs text-muted">
              Upload a medicine photo for AI analysis, or enter a barcode
            </p>
          </div>
          <Button
            type="button"
            variant={flashlightOn ? "primary" : "outline"}
            size="sm"
            className="shrink-0 touch-manipulation"
            onClick={() => setFlashlightOn((v) => !v)}
            aria-pressed={flashlightOn}
            aria-label={flashlightOn ? "Turn flashlight off" : "Turn flashlight on"}
          >
            {flashlightOn ? (
              <Flashlight className="h-4 w-4" />
            ) : (
              <FlashlightOff className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {flashlightOn ? "Light on" : "Light"}
            </span>
          </Button>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div
          className={cn(
            "relative min-h-[220px] overflow-hidden rounded-2xl border-2 transition-all duration-300 sm:min-h-[260px]",
            showOverlay ? "border-primary shadow-glow-lg" : "border-border/60",
            flashlightOn && "barcode-viewport-flashlight"
          )}
        >
          <div className="barcode-border-glow absolute inset-x-0 top-0 z-10 h-0.5 opacity-80" />

          {photoPreviewUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoPreviewUrl}
                alt="Medicine package preview"
                className={cn(
                  "h-full min-h-[220px] w-full object-contain bg-black/90 sm:min-h-[260px]",
                  showOverlay && "brightness-90 contrast-110"
                )}
              />
              {showOverlay && (
                <BarcodeScanOverlay
                  progress={scanProgress}
                  stageLabel={scanStage}
                  flashlightOn={flashlightOn}
                />
              )}
            </>
          ) : (
            <div className="barcode-viewport relative flex h-full min-h-[220px] flex-col items-center justify-center px-6 py-8 text-center sm:min-h-[260px]">
              {!showOverlay && (
                <>
                  <ScanBarcode className="h-14 w-14 text-primary/80 animate-float" />
                  <p className="mt-4 text-sm font-medium text-foreground">
                    Ready to analyze
                  </p>
                  <p className="mt-1 max-w-xs text-xs text-muted/90">
                    Upload a photo of your medicine package for AI vision
                    analysis, or enter a barcode below.
                  </p>
                  {manualCode && (
                    <p className="mt-4 rounded-full glass-strong px-3 py-1 font-mono text-xs text-primary">
                      {manualCode}
                    </p>
                  )}
                </>
              )}
              {showOverlay && (
                <BarcodeScanOverlay
                  progress={scanProgress}
                  stageLabel={scanStage}
                  flashlightOn={flashlightOn}
                />
              )}
            </div>
          )}
        </div>

        <div className="mt-4 space-y-4">
          <BarcodePhotoUpload
            previewUrl={photoPreviewUrl}
            disabled={busy}
            scanning={busy}
            onFileSelect={(file) => void handlePhotoSelect(file)}
            onClear={handleClearPhoto}
            onInvalidFile={onError}
          />

          <div className="space-y-3 border-t border-border/60 pt-4">
            <label htmlFor="barcode-input" className="text-sm font-medium text-foreground">
              Or enter barcode number
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="barcode-input"
                inputMode="numeric"
                autoComplete="off"
                placeholder="e.g. 8901234567890"
                value={manualCode}
                disabled={busy}
                className="min-h-11 font-mono text-base sm:text-sm"
                onChange={(e) => setManualCode(e.target.value.replace(/\s/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && runLookup(manualCode)}
              />
              <Button
                type="button"
                disabled={busy || !manualCode.trim()}
                className="min-h-11 w-full touch-manipulation sm:w-auto sm:min-w-[140px]"
                onClick={() => runLookup(manualCode)}
              >
                {busy ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <ScanBarcode className="h-4 w-4" />
                    Analyze
                  </>
                )}
              </Button>
            </div>

            <BarcodeSampleChips
              onSelect={(code) => {
                revokePreview();
                setManualCode(code);
                runLookup(code);
              }}
              disabled={busy}
            />
          </div>
        </div>

        {lastLookup && !busy && (
          <p className="mt-3 text-xs text-muted">
            Last analyzed:{" "}
            <code className="font-mono text-foreground">{lastLookup}</code>
          </p>
        )}
      </div>
    </Card>
  );
}
