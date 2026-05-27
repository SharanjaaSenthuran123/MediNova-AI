/** Shared demo emergency data for API + UI fallbacks. */
export interface EmergencyContactDefault {
  name: string;
  relation: string;
  phone: string;
  email?: string;
}

export interface SimulatedLocationDefault {
  address: string;
  lat: number;
  lng: number;
}

export const defaultEmergencyLocation: SimulatedLocationDefault = {
  address: "142 Oak Street, Downtown Medical District, San Francisco, CA 94102",
  lat: 37.7749,
  lng: -122.4194,
};

export const defaultEmergencyContacts: EmergencyContactDefault[] = [
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
