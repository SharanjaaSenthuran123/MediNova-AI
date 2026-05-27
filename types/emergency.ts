export type AlertStepStatus = "pending" | "active" | "completed";



export interface AlertStep {

  id: string;

  label: string;

  detail: string;

  status: AlertStepStatus;

  timestamp?: string;

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



export type DeliveryStatus = "sent" | "failed" | "skipped" | "simulated";



export interface ChannelDelivery {

  channel: "sms" | "email" | "push" | "simulated";

  status: DeliveryStatus;

  recipient?: string;

  contactName?: string;

  detail: string;

}



export interface NotifiedContact {

  type: "caretaker" | "physician" | "dispatch";

  name: string;

  channel: "sms" | "email" | "push" | "simulated";

}



export interface EmergencyAlertResult {

  success: boolean;

  simulation: boolean;

  message: string;

  location: SimulatedLocation;

  notified: NotifiedContact[];

  deliveries: ChannelDelivery[];

  authenticated: boolean;

  demoMode?: boolean;

  alertId?: string;

}



export interface EmergencyServiceStatus {

  apiConnected: boolean;

  authenticated: boolean;

  email: {

    configured: boolean;

    ready: boolean;

  };

  sms: {

    configured: boolean;

    ready: boolean;

    trialNote?: string;

  };

  dispatch: {

    configured: false;

    mode: "simulation_only";

  };

}



export type SimulationPhase = "idle" | "loading" | "running" | "complete";


