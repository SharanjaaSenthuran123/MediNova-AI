import { FileText, Pill } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { MedicineCard } from "@/components/healthcare/MedicineCard";
import type { OCRResult } from "@/types/medicine";

interface OCRResultsProps {
  result: OCRResult;
}

export function OCRResults({ result }: OCRResultsProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5 text-primary" />
            Extracted text
          </CardTitle>
          <CardDescription>Raw OCR output from the prescription image</CardDescription>
        </CardHeader>
        <pre className="max-h-48 overflow-auto rounded-xl border border-border bg-background p-4 text-xs leading-relaxed text-muted whitespace-pre-wrap">
          {result.rawText}
        </pre>
      </Card>

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
          <Pill className="h-5 w-5 text-primary" />
          Detected medicines
          <span className="text-sm font-normal text-muted">
            ({result.medicines.length})
          </span>
        </h3>

        {result.medicines.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {result.medicines.map((name) => (
              <li key={name}>
                <MedicineCard
                  variant="compact"
                  medicine={{ name, dosage: "Verify dosage with your pharmacist" }}
                />
              </li>
            ))}
          </ul>
        ) : (
          <Card className="text-center text-sm text-muted">
            No medicine-like entries detected. Review the raw text above or try a
            clearer image.
          </Card>
        )}
      </section>
    </div>
  );
}
