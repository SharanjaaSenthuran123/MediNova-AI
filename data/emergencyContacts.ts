import type { EmergencyContact, SimulatedLocation } from "@/types/emergency";
import {
  defaultEmergencyContacts,
  defaultEmergencyLocation,
} from "@/lib/emergency-defaults";

export const emergencyContacts: EmergencyContact[] = defaultEmergencyContacts;

export const demoLocation: SimulatedLocation = defaultEmergencyLocation;
