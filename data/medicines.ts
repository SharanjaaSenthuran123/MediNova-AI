import type { Medicine } from "@/types/medicine";

export const medicines: Medicine[] = [
  {
    barcode: "8901234567890",
    name: "Paracetamol 500mg",
    genericName: "Acetaminophen",
    dosage: "500mg — 1 tablet every 6 hours (max 4/day)",
    manufacturer: "MediPharm Labs",
    expiry: "2027-03-15",
    warnings: [
      "Do not exceed recommended dose",
      "Avoid alcohol while taking",
      "Consult doctor if fever persists beyond 3 days",
    ],
    description: "Pain reliever and fever reducer.",
  },
  {
    barcode: "8901234567891",
    name: "Amoxicillin 250mg",
    genericName: "Amoxicillin",
    dosage: "250mg — 1 capsule three times daily for 7 days",
    manufacturer: "HealthCore Pharma",
    expiry: "2026-11-20",
    warnings: [
      "Complete full antibiotic course",
      "May cause allergic reactions — stop if rash occurs",
      "Take with food to reduce stomach upset",
    ],
    description: "Antibiotic for bacterial infections.",
  },
  {
    barcode: "8901234567892",
    name: "Omeprazole 20mg",
    genericName: "Omeprazole",
    dosage: "20mg — 1 capsule before breakfast",
    manufacturer: "GastroMed Inc.",
    expiry: "2025-01-08",
    warnings: [
      "Long-term use requires medical supervision",
      "Do not crush or chew capsules",
    ],
    description: "Proton pump inhibitor for acid reflux and ulcers.",
  },
  {
    barcode: "8901234567893",
    name: "Metformin 500mg",
    genericName: "Metformin HCl",
    dosage: "500mg — 1 tablet twice daily with meals",
    manufacturer: "DiabetesCare Ltd.",
    expiry: "2026-06-15",
    warnings: [
      "Monitor blood sugar regularly",
      "Stay hydrated",
      "Report muscle pain or unusual fatigue",
    ],
    description: "Oral diabetes medicine to control blood sugar.",
  },
  {
    barcode: "8901234567894",
    name: "Cetirizine 10mg",
    genericName: "Cetirizine",
    dosage: "10mg — 1 tablet once daily",
    manufacturer: "AllergyFree Co.",
    expiry: "2027-06-12",
    warnings: [
      "May cause drowsiness — avoid driving if affected",
      "Avoid alcohol",
    ],
    description: "Antihistamine for allergies and hay fever.",
  },
];

export function findMedicineByBarcode(barcode: string): Medicine | undefined {
  const normalized = barcode.trim().replace(/\s/g, "");
  return medicines.find((m) => m.barcode === normalized);
}
