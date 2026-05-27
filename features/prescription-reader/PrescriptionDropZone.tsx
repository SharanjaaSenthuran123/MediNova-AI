"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { CloudUpload, ImageIcon, Sparkles, X } from "lucide-react";
import { imageFileTypeHint, isAcceptedImageFile } from "@/lib/image-file";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { OCRScanOverlay } from "@/features/prescription-reader/OCRScanOverlay";

interface PrescriptionDropZoneProps {
  previewUrl?: string | null;
  scanning?: boolean;
  scanProgress?: number;
  scanStageLabel?: string;
  disabled?: boolean;
  hint?: string;
  onFileSelect: (file: File) => void;
  onClear?: () => void;
  onInvalidFile?: (message: string) => void;
}

export function PrescriptionDropZone({
  previewUrl,
  scanning = false,
  scanProgress = 0,
  scanStageLabel,
  disabled,
  hint = "PNG, JPG, or WEBP · max 10 MB · processed locally",
  onFileSelect,
  onClear,
  onInvalidFile,
}: PrescriptionDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [dragReject, setDragReject] = useState(false);

  function validateAndSelect(file: File | undefined) {
    if (!file) return;

    if (!isAcceptedImageFile(file)) {
      setDragReject(true);
      onInvalidFile?.(`Please drop an image file (${imageFileTypeHint()}).`);
      setTimeout(() => setDragReject(false), 1200);
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
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">
          Prescription image
        </p>
        <span className="flex items-center gap-1 text-xs text-muted">
          <Sparkles className="h-3 w-3 text-primary" />
          Drag & drop enabled
        </span>
      </div>

      {previewUrl ? (
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border-2 transition-all duration-300",
            scanning
              ? "border-primary shadow-glow-lg scanner-frame"
              : "border-border shadow-glass"
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Prescription preview"
            className={cn(
              "max-h-72 w-full object-contain bg-background/80 transition-all duration-500",
              scanning && "brightness-90 contrast-110"
            )}
          />
          {scanning && (
            <OCRScanOverlay
              progress={scanProgress}
              stageLabel={scanStageLabel}
            />
          )}
          {onClear && !scanning && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 glass-strong shadow-sm"
              onClick={onClear}
              disabled={disabled}
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
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
            setDragReject(false);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={cn(
            "group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed px-6 py-14 transition-all duration-300",
            dragReject && "border-danger bg-danger/5",
            dragOver && !dragReject && "drop-zone-active scale-[1.01]",
            !dragOver &&
              !dragReject &&
              "glass-input hover:border-primary/50 hover:bg-primary/5 hover:shadow-glow",
            disabled && "pointer-events-none opacity-50"
          )}
        >
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 gradient-panel" />

          <span className="gradient-icon relative flex h-16 w-16 items-center justify-center rounded-2xl shadow-glow animate-float">
            {dragOver ? (
              <CloudUpload className="h-8 w-8" />
            ) : (
              <ImageIcon className="h-8 w-8" />
            )}
          </span>

          <p className="relative mt-5 text-base font-semibold text-foreground">
            {dragReject
              ? "Images only — try PNG or JPG"
              : dragOver
                ? "Release to upload"
                : "Drop prescription here"}
          </p>
          <p className="relative mt-1.5 text-sm text-muted">
            or click to browse files
          </p>
          <p className="relative mt-3 rounded-full border border-border/80 bg-background/60 px-3 py-1 text-xs text-muted">
            {hint}
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}
