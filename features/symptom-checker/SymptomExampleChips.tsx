import { SampleChips } from "@/components/ui/SampleChips";
import { symptomExamples } from "@/data/symptomExamples";

interface SymptomExampleChipsProps {
  onSelect: (text: string) => void;
  disabled?: boolean;
}

export function SymptomExampleChips({
  onSelect,
  disabled,
}: SymptomExampleChipsProps) {
  return (
    <SampleChips
      label="Try an example"
      items={symptomExamples.map((example) => ({
        id: example.text,
        label: example.label,
      }))}
      onSelect={onSelect}
      disabled={disabled}
    />
  );
}
