import type { Medicine, MedicineAIInsight } from "@/types/medicine";

export interface BarcodeLookupResult {
  medicine: Medicine | null;
  barcode: string;
  demoMode?: boolean;
  aiInsight?: MedicineAIInsight | null;
  message?: string;
}

export async function lookupMedicineBarcode(
  barcode: string
): Promise<BarcodeLookupResult> {
  const trimmed = barcode.trim();
  if (!trimmed) {
    return { medicine: null, barcode: "" };
  }

  const res = await fetch(
    `/api/medicine-lookup?barcode=${encodeURIComponent(trimmed)}`,
    { credentials: "include" }
  );

  if (res.ok) {
    const data = (await res.json()) as {
      medicine: Medicine;
      demoMode?: boolean;
      aiInsight?: MedicineAIInsight;
      message?: string;
    };
    return {
      medicine: data.medicine,
      barcode: trimmed,
      demoMode: data.demoMode,
      aiInsight: data.aiInsight ?? null,
      message: data.message,
    };
  }

  if (res.status === 404) {
    return { medicine: null, barcode: trimmed };
  }

  throw new Error("Medicine lookup failed");
}
