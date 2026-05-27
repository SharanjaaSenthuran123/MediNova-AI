import { SampleChips } from "@/components/ui/SampleChips";
import { prescriptionSamples } from "@/data/prescriptionSamples";

interface PrescriptionSampleChipsProps {
  onSelect: (index: number) => void;
  disabled?: boolean;
}

export function PrescriptionSampleChips({
  onSelect,
  disabled,
}: PrescriptionSampleChipsProps) {
  return (
    <SampleChips
      label="Try a sample (no upload)"
      items={prescriptionSamples.map((sample, index) => ({
        id: String(index),
        label: sample.label,
      }))}
      onSelect={(id) => onSelect(Number(id))}
      disabled={disabled}
    />
  );
}
