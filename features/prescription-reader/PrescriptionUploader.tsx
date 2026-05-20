"use client";

import { useCallback, useState } from "react";
import Tesseract from "tesseract.js";
import { ScanText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FileUpload } from "@/components/ui/FileUpload";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { OCRResult } from "@/types/medicine";
import {
  cleanOCRText,
  extractMedicineNames,
} from "@/features/prescription-reader/ocr.helpers";

interface PrescriptionUploaderProps {
  onResult: (result: OCRResult) => void;
  onError: (message: string) => void;
}

export function PrescriptionUploader({
  onResult,
  onError,
}: PrescriptionUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleFileSelect = useCallback(
    (selected: File) => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    },
    [previewUrl]
  );

  const handleClear = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setProgress(0);
  }, [previewUrl]);

  async function runOCR() {
    if (!file) return;

    setLoading(true);
    setProgress(0);

    try {
      const result = await Tesseract.recognize(file, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text" && typeof m.progress === "number") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const rawText = cleanOCRText(result.data.text);

      if (!rawText.trim()) {
        onError(
          "No text detected. Try a clearer, well-lit photo of the prescription."
        );
        return;
      }

      const medicines = extractMedicineNames(rawText);

      onResult({ rawText, medicines });
    } catch {
      onError("OCR failed. Please try another image or check file format.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <FileUpload
        onFileSelect={handleFileSelect}
        previewUrl={previewUrl}
        onClear={handleClear}
        disabled={loading}
      />

      {loading && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Extracting text...</span>
            <span className="font-medium text-primary">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <Button
        type="button"
        className="mt-4 w-full"
        disabled={!file || loading}
        onClick={runOCR}
      >
        {loading ? (
          <>
            <LoadingSpinner size="sm" />
            Running OCR...
          </>
        ) : (
          <>
            <ScanText className="h-4 w-4" />
            Extract medicines
          </>
        )}
      </Button>
    </Card>
  );
}
