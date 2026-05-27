"use client";

import { useCallback, useState } from "react";
import { ScanText, ShieldCheck } from "lucide-react";
import { useConfigStatus } from "@/hooks/useConfigStatus";
import { imageFileTypeHint, isAcceptedImageFile } from "@/lib/image-file";
import { scanPrescriptionImage } from "@/lib/prescription-scan-client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PrescriptionDropZone } from "@/features/prescription-reader/PrescriptionDropZone";
import { PrescriptionSampleChips } from "@/features/prescription-reader/PrescriptionSampleChips";
import type { OCRResult } from "@/types/medicine";
import {
  getDemoOCRResult,
  type OCRProgressState,
} from "@/features/prescription-reader/ocr.helpers";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

interface PrescriptionUploaderProps {
  onResult: (result: OCRResult) => void;
  onError: (message: string) => void;
  onLoadingChange?: (loading: boolean) => void;
  onProgressChange?: (state: OCRProgressState) => void;
  onPreviewChange?: (url: string | null) => void;
}

export function PrescriptionUploader({
  onResult,
  onError,
  onLoadingChange,
  onProgressChange,
  onPreviewChange,
}: PrescriptionUploaderProps) {
  const { status: configStatus } = useConfigStatus();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progressState, setProgressState] = useState<OCRProgressState>({
    progress: 0,
    stage: "idle",
    stageLabel: "Ready to scan",
  });

  function updateProgress(state: OCRProgressState) {
    setProgressState(state);
    onProgressChange?.(state);
  }

  function setLoadingState(next: boolean) {
    setLoading(next);
    onLoadingChange?.(next);
    if (!next) {
      updateProgress({
        progress: 0,
        stage: "idle",
        stageLabel: "Ready to scan",
      });
    }
  }

  const handleFileSelect = useCallback(
    (selected: File) => {
      if (!isAcceptedImageFile(selected)) {
        onError(`Please upload a ${imageFileTypeHint()} image.`);
        return;
      }
      if (selected.size > MAX_FILE_BYTES) {
        onError("Image is too large. Please use a file under 10 MB.");
        return;
      }
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(selected);
      setFile(selected);
      setPreviewUrl(url);
      onPreviewChange?.(url);
      onError("");
    },
    [previewUrl, onError, onPreviewChange]
  );

  const handleClear = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    onPreviewChange?.(null);
    updateProgress({
      progress: 0,
      stage: "idle",
      stageLabel: "Ready to scan",
    });
  }, [previewUrl, onPreviewChange]);

  function handleSampleSelect(index: number) {
    onError("");
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      onPreviewChange?.(null);
    }
    setFile(null);
    onResult(getDemoOCRResult(index));
  }

  async function runOCR() {
    if (!file) return;

    setLoadingState(true);
    updateProgress({
      progress: 5,
      stage: "loading-engine",
      stageLabel: "Loading OCR engine…",
    });

    try {
      const result = await scanPrescriptionImage(file, updateProgress);

      if (!result.rawText.trim()) {
        onError(
          "No text detected. Try a clearer, well-lit photo of the prescription."
        );
        return;
      }

      onResult(result);
    } catch (err) {
      console.error("Prescription OCR failed:", err);
      onError(
        "Could not read the prescription. Check your connection, use a clearer photo, or try a sample prescription."
      );
    } finally {
      setLoadingState(false);
    }
  }

  return (
    <Card variant="elevated" className="space-y-1">
      <div className="mb-4 flex items-center gap-2 rounded-xl gradient-panel px-3 py-2">
        <ShieldCheck className="h-4 w-4 text-primary" />
        <p className="text-xs text-muted">
          {configStatus?.liveAi
            ? "Live AI vision reads prescriptions accurately — image sent securely for analysis"
            : "Browser OCR runs locally — add OPENAI_API_KEY for more accurate AI reading"}
        </p>
      </div>

      <PrescriptionDropZone
        previewUrl={previewUrl}
        scanning={loading && Boolean(previewUrl)}
        scanProgress={progressState.progress}
        scanStageLabel={progressState.stageLabel}
        disabled={loading}
        onFileSelect={handleFileSelect}
        onClear={handleClear}
        onInvalidFile={onError}
      />

      <ul className="mt-4 space-y-1.5 text-xs text-muted">
        <li className="flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-primary" />
          Use flat, well-lit photos for best OCR accuracy
        </li>
        <li className="flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-primary" />
          Handwritten scripts may need manual verification
        </li>
      </ul>

      <div className="mt-5">
        <PrescriptionSampleChips
          onSelect={handleSampleSelect}
          disabled={loading}
        />
      </div>

      <Button
        type="button"
        className="mt-5 w-full shadow-glow"
        disabled={!file || loading}
        onClick={runOCR}
      >
        {loading && file ? (
          <>
            <LoadingSpinner size="sm" />
            Scanning… {progressState.progress}%
          </>
        ) : (
          <>
            <ScanText className="h-4 w-4" />
            Start OCR scan
          </>
        )}
      </Button>
    </Card>
  );
}
