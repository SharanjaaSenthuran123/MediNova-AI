import type { EmergencyContact, SimulatedLocation } from "@/types/emergency";

export const emergencyContacts: EmergencyContact[] = [
  {
    name: "Sarah Johnson",
    relation: "Primary caretaker (Spouse)",
    phone: "+1 (555) 234-8901",
    email: "sarah.j@email.com",
  },
  {
    name: "Dr. Michael Chen",
    relation: "Family physician",
    phone: "+1 (555) 876-5432",
    email: "mchen@cityclinic.com",
  },
  {
    name: "City General Hospital",
    relation: "Nearest emergency facility",
    phone: "911",
  },
];

export const demoLocation: SimulatedLocation = {
  address: "142 Oak Street, Downtown Medical District, San Francisco, CA 94102",
  lat: 37.7749,
  lng: -122.4194,
};
