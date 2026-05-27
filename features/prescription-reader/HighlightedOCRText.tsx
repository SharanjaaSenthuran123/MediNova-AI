"use client";

import {
  getMedicineHighlightTerms,
  segmentTextWithHighlights,
} from "@/features/prescription-reader/ocr.helpers";
import type { DetectedMedicine } from "@/types/medicine";
import { cn } from "@/lib/utils";

interface HighlightedOCRTextProps {
  text: string;
  medicines: DetectedMedicine[];
  expanded?: boolean;
  className?: string;
}

export function HighlightedOCRText({
  text,
  medicines,
  expanded = false,
  className,
}: HighlightedOCRTextProps) {
  const terms = getMedicineHighlightTerms(medicines);
  const segments = segmentTextWithHighlights(text, terms);

  return (
    <pre
      className={cn(
        "overflow-auto rounded-xl border border-border/80 bg-background/80 p-4 text-xs leading-relaxed whitespace-pre-wrap",
        expanded ? "max-h-96" : "max-h-36",
        className
      )}
    >
      {segments.map((segment, i) =>
        segment.highlight ? (
          <mark key={i} className="medicine-highlight">
            {segment.text}
          </mark>
        ) : (
          <span key={i} className="text-muted">
            {segment.text}
          </span>
        )
      )}
    </pre>
  );
}
