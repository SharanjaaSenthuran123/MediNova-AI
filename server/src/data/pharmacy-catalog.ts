/** Shared pharmacy catalog — used for bootstrap when DB collections are empty. */
export const PHARMACY_CATALOG = [
  {
    name: "MediCare Pharmacy Colombo",
    address: "Galle Road, Kollupitiya",
    city: "Colombo",
    phone: "+94-11-255-0101",
    lat: 6.9271,
    lng: 79.8612,
    is24Hours: true,
    isEmergency: true,
    rating: 4.8,
    openHours: "24/7",
  },
  {
    name: "City General Pharmacy",
    address: "Duplication Road, Bambalapitiya",
    city: "Colombo",
    phone: "+94-11-255-0102",
    lat: 6.888,
    lng: 79.858,
    is24Hours: false,
    isEmergency: true,
    rating: 4.5,
    openHours: "8:00 AM - 10:00 PM",
  },
  {
    name: "Wellness Plus Pharmacy",
    address: "High Level Road, Nugegoda",
    city: "Colombo",
    phone: "+94-11-255-0103",
    lat: 6.865,
    lng: 79.889,
    is24Hours: false,
    isEmergency: false,
    rating: 4.6,
    openHours: "9:00 AM - 9:00 PM",
  },
] as const;

export const PHARMACY_MEDICINES = [
  {
    name: "Paracetamol 500mg",
    genericName: "Acetaminophen",
    expiry: "2027-03-15",
    requiresPrescription: false,
    category: "general",
    aliases: ["panadol", "tylenol", "acetaminophen"],
  },
  {
    name: "Amoxicillin 250mg",
    genericName: "Amoxicillin",
    expiry: "2026-11-20",
    requiresPrescription: true,
    category: "general",
    aliases: ["amoxil"],
  },
  {
    name: "Omeprazole 20mg",
    genericName: "Omeprazole",
    expiry: "2027-06-08",
    requiresPrescription: false,
    category: "general",
    aliases: ["prilosec"],
  },
  {
    name: "Metformin 500mg",
    genericName: "Metformin HCl",
    expiry: "2026-06-15",
    requiresPrescription: true,
    category: "diabetes",
    aliases: ["glucophage"],
  },
  {
    name: "Ibuprofen 400mg",
    genericName: "Ibuprofen",
    expiry: "2027-01-20",
    requiresPrescription: false,
    category: "general",
    aliases: ["advil", "nurofen"],
  },
  {
    name: "Cetirizine 10mg",
    genericName: "Cetirizine",
    expiry: "2027-04-10",
    requiresPrescription: false,
    category: "general",
    aliases: ["zyrtec"],
  },
] as const;

const ALIAS_MAP = new Map<string, string[]>();
for (const med of PHARMACY_MEDICINES) {
  ALIAS_MAP.set(med.name.toLowerCase(), [...med.aliases]);
}

export function expandMedicineSearchTerms(query: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = new Set<string>([q]);
  for (const med of PHARMACY_MEDICINES) {
    if (
      med.name.toLowerCase().includes(q) ||
      med.genericName?.toLowerCase().includes(q) ||
      med.aliases.some((a) => a.includes(q) || q.includes(a))
    ) {
      terms.add(med.name.toLowerCase());
      med.aliases.forEach((a) => terms.add(a));
    }
  }
  return [...terms];
}
