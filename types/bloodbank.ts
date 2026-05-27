export interface BloodStockSummary {
  bloodGroup: string;
  units: number;
  locations: number;
  isRare: boolean;
  status: "critical" | "low" | "adequate";
}

export interface BloodRequest {
  _id: string;
  patientName: string;
  bloodGroup: string;
  unitsNeeded: number;
  hospital: string;
  urgency: "normal" | "urgent" | "critical";
  status: string;
  aiUrgencyScore?: number;
  createdAt: string;
}

export interface Donor {
  _id: string;
  name: string;
  bloodGroup: string;
  city: string;
  isAvailable: boolean;
  rewardPoints: number;
  qrCodeId: string;
}

export interface BloodEmergencyAlert {
  _id: string;
  bloodGroup: string;
  message: string;
  urgency: string;
  createdAt: string;
}
