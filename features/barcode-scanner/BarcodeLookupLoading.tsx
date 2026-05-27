import { ScanBarcode } from "lucide-react";
import { FeatureLoadingCard } from "@/components/ui/FeatureLoadingCard";

interface BarcodeLookupLoadingProps {
  liveAi?: boolean;
  photoMode?: boolean;
}

export function BarcodeLookupLoading({ liveAi, photoMode }: BarcodeLookupLoadingProps) {
  return (
    <FeatureLoadingCard
      icon={ScanBarcode}
      title={photoMode ? "Analyzing medicine photo" : "MediScan in progress"}
      subtitle={
        photoMode
          ? liveAi
            ? "OpenAI Vision is reading the label, matching barcodes, and preparing safety insights…"
            : "Preparing demo photo analysis and checking the medicine database…"
          : liveAi
            ? "Matching barcode, loading medicine data, and requesting live OpenAI safety insights…"
            : "Matching barcode, loading medicine data, and preparing demo AI safety insights…"
      }
      ariaLabel="Analyzing medicine"
      steps={
        photoMode
          ? [
              "Reading label with vision AI",
              "Detecting barcode if visible",
              "Generating safety insights",
            ]
          : [
              "Decoding barcode signal",
              "Querying medicine database",
              liveAi ? "Calling OpenAI for safety brief" : "Preparing demo safety brief",
            ]
      }
    />
  );
}
