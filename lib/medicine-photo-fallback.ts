import type { MedicinePhotoAnalysis } from "@/types/medicine";

export function getDemoMedicinePhotoAnalysis(): MedicinePhotoAnalysis {
  return {
    medicineName: "Paracetamol 500mg Tablets",
    genericName: "Acetaminophen",
    dosage: "500mg — 1 tablet every 6 hours (max 4 per day)",
    manufacturer: "Demo Pharma Ltd.",
    expiry: "2027-03-15",
    barcode: "8901234567890",
    warnings: [
      "Do not exceed recommended dose",
      "Avoid alcohol while taking",
      "Consult a doctor if symptoms persist",
    ],
    description:
      "Over-the-counter pain reliever and fever reducer. Demo analysis — upload a real photo with OPENAI_API_KEY configured for live vision AI.",
    labelNotes: [
      "Store below 25°C",
      "Keep out of reach of children",
      "Read leaflet before use",
    ],
    confidence: "medium",
    source: "demo",
  };
}
