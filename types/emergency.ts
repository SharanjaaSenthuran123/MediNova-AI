export type AlertStepStatus = "pending" | "active" | "completed";

export interface AlertStep {
  id: string;
  label: string;
  detail: string;
  status: AlertStepStatus;
}

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
  email?: string;
}

export interface SimulatedLocation {
  address: string;
  lat: number;
  lng: number;
}
