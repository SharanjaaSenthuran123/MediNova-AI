import { SampleChips } from "@/components/ui/SampleChips";
import { barcodeSamples } from "@/data/barcodeSamples";

interface BarcodeSampleChipsProps {
  onSelect: (barcode: string) => void;
  disabled?: boolean;
}

export function BarcodeSampleChips({
  onSelect,
  disabled,
}: BarcodeSampleChipsProps) {
  return (
    <SampleChips
      label="Quick lookup — tap a known barcode"
      items={barcodeSamples.map((sample) => ({
        id: sample.barcode,
        label: sample.label,
      }))}
      onSelect={onSelect}
      disabled={disabled}
    />
  );
}
