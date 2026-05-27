"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Camera, ImageUp, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface BarcodePhotoUploadProps {
  previewUrl?: string | null;
  disabled?: boolean;
  scanning?: boolean;
  onFileSelect: (file: File) => void;
  onClear?: () => void;
  onInvalidFile?: (message: string) => void;
}

export function BarcodePhotoUpload({
  previewUrl,
  disabled,
  scanning,
  onFileSelect,
  onClear,
  onInvalidFile,
}: BarcodePhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function validateAndSelect(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      onInvalidFile?.("Please upload a PNG, JPG, or WEBP image.");
      return;
    }
    onFileSelect(file);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    validateAndSelect(e.dataTransfer.files[0]);
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    validateAndSelect(e.target.files?.[0]);
    e.target.value = "";
  }

  if (previewUrl) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Camera className="h-4 w-4 text-primary" />
            Medicine photo
          </p>
          {onClear && !scanning && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClear}
              disabled={disabled}
            >
              <X className="h-3.5 w-3.5" />
              Remove
            </Button>
          )}
        </div>
        <p className="text-xs text-muted">
          {scanning
            ? "OpenAI Vision is reading your medicine label…"
            : "Analysis complete — review results on the right."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="flex items-center gap-2 text-sm font-medium text-foreground">
        <ImageUp className="h-4 w-4 text-primary" />
        Upload medicine photo for AI analysis
      </p>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 transition-all duration-300 touch-manipulation",
          dragOver
            ? "border-primary bg-primary/10 shadow-glow"
            : "glass-input hover:border-primary/50 hover:bg-primary/5",
          disabled && "pointer-events-none opacity-50"
        )}
      >
        <span className="gradient-icon flex h-11 w-11 items-center justify-center rounded-xl">
          <Upload className="h-5 w-5" />
        </span>
        <p className="mt-3 text-sm font-medium">Drop photo or tap to upload</p>
        <p className="mt-1 text-center text-xs text-muted">
          Photograph the medicine box or label — AI extracts name, dosage, warnings,
          and expiry · PNG, JPG, or WEBP · max 10 MB
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        capture="environment"
        className="hidden"
        disabled={disabled}
        onChange={onChange}
      />
    </div>
  );
}
