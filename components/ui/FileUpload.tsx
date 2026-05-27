"use client";

import { useRef, useState, type DragEvent, type ChangeEvent } from "react";
import { Upload, ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface FileUploadProps {
  accept?: string;
  onFileSelect: (file: File) => void;
  previewUrl?: string | null;
  onClear?: () => void;
  disabled?: boolean;
  label?: string;
  hint?: string;
}

export function FileUpload({
  accept = "image/*",
  onFileSelect,
  previewUrl,
  onClear,
  disabled,
  label = "Upload prescription image",
  hint = "PNG, JPG, or WEBP — prescription photo",
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFile(file: File | undefined) {
    if (file && file.type.startsWith("image/")) {
      onFileSelect(file);
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    handleFile(e.target.files?.[0]);
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground">{label}</p>

      {previewUrl ? (
        <div className="relative overflow-hidden rounded-xl border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Prescription preview"
            className="max-h-64 w-full object-contain bg-background"
          />
          {onClear && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 bg-card/90"
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
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 transition-all duration-300",
            dragOver
              ? "border-primary bg-primary/10 shadow-glow"
              : "glass-input hover:border-primary/50 hover:bg-primary/5",
            disabled && "pointer-events-none opacity-50"
          )}
        >
          <span className="gradient-icon flex h-14 w-14 items-center justify-center rounded-2xl">
            <Upload className="h-7 w-7" />
          </span>
          <p className="mt-4 text-sm font-medium">
            Drag & drop or click to upload
          </p>
          <p className="mt-1 text-xs text-muted">{hint}</p>
          <ImageIcon className="mt-3 h-4 w-4 text-muted" />
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}
