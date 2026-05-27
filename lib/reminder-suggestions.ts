import type { ReminderEntry } from "@/types/integrations";
import type { UserRecord } from "@/types/user";
import { createEntryId } from "@/lib/db/store";

export interface ReminderSuggestion {
  medicineName: string;
  source: "prescription" | "barcode";
  label: string;
}

export function getReminderSuggestions(record: UserRecord): ReminderSuggestion[] {
  const existing = new Set(
    record.reminders.map((r) => r.medicineName.toLowerCase())
  );
  const suggestions: ReminderSuggestion[] = [];

  for (const rx of record.prescriptionHistory.slice(0, 5)) {
    for (const name of rx.medicines) {
      const key = name.toLowerCase();
      if (!existing.has(key)) {
        suggestions.push({
          medicineName: name,
          source: "prescription",
          label: `From prescription OCR (${new Date(rx.createdAt).toLocaleDateString()})`,
        });
        existing.add(key);
      }
    }
  }

  for (const scan of record.barcodeHistory.slice(0, 5)) {
    if (!scan.found) continue;
    const key = scan.medicineName.toLowerCase();
    if (!existing.has(key)) {
      suggestions.push({
        medicineName: scan.medicineName,
        source: "barcode",
        label: `From barcode scan (${scan.barcode})`,
      });
      existing.add(key);
    }
  }

  return suggestions.slice(0, 8);
}

export function createReminderFromSuggestion(
  userId: string,
  suggestion: ReminderSuggestion
): ReminderEntry {
  return {
    id: createEntryId("rem"),
    userId,
    medicineName: suggestion.medicineName,
    schedule: "morning",
    enabled: true,
    channel: "push",
    source: suggestion.source,
    createdAt: new Date().toISOString(),
  };
}
