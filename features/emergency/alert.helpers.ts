import {
  defaultEmergencyContacts,
  defaultEmergencyLocation,
} from "@/lib/emergency-defaults";
import { getBrowserLocation, reverseGeocode } from "@/lib/geolocation";
import type {
  ChannelDelivery,
  EmergencyAlertResult,
  EmergencyServiceStatus,
} from "@/types/emergency";

function buildFallbackDeliveries(reason: string): ChannelDelivery[] {
  return [
    {
      channel: "sms",
      status: "simulated",
      contactName: defaultEmergencyContacts[0]?.name,
      detail: reason,
    },
    {
      channel: "email",
      status: "simulated",
      contactName: defaultEmergencyContacts[1]?.name,
      detail: reason,
    },
    {
      channel: "simulated",
      status: "simulated",
      contactName: "Emergency services",
      detail: "911 dispatch is simulation only",
    },
  ];
}

function buildFallbackResult(
  reason: string,
  location = defaultEmergencyLocation
): EmergencyAlertResult {
  const deliveries = buildFallbackDeliveries(reason);
  return {
    success: true,
    simulation: true,
    demoMode: true,
    authenticated: false,
    message: reason,
    location,
    notified: [
      {
        type: "caretaker",
        name: defaultEmergencyContacts[0]?.name ?? "Primary caretaker",
        channel: "sms",
      },
      {
        type: "physician",
        name: defaultEmergencyContacts[1]?.name ?? "Physician",
        channel: "email",
      },
      {
        type: "dispatch",
        name: defaultEmergencyContacts[2]?.name ?? "Hospital",
        channel: "simulated",
      },
    ],
    deliveries,
  };
}

export async function fetchEmergencyServiceStatus(): Promise<EmergencyServiceStatus> {
  try {
    const res = await fetch("/api/emergency-alert/status", {
      credentials: "include",
    });
    if (!res.ok) throw new Error("status unavailable");
    return (await res.json()) as EmergencyServiceStatus;
  } catch {
    return {
      apiConnected: false,
      authenticated: false,
      email: { configured: false, ready: false },
      sms: { configured: false, ready: false },
      dispatch: { configured: false, mode: "simulation_only" },
    };
  }
}

async function resolveEmergencyLocation() {
  const geo = await getBrowserLocation();
  let address = geo.address;

  if (geo.source === "gps") {
    const reversed = await reverseGeocode(geo.lat, geo.lng);
    if (reversed) address = reversed;
  }

  return {
    lat: geo.lat,
    lng: geo.lng,
    address: address ?? `${geo.lat.toFixed(4)}, ${geo.lng.toFixed(4)}`,
  };
}

export async function triggerEmergencyAlert(): Promise<EmergencyAlertResult> {
  const location = await resolveEmergencyLocation();

  try {
    const res = await fetch("/api/emergency-alert", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Emergency SOS triggered from MediNova",
        location,
        timestamp: new Date().toISOString(),
      }),
    });

    if (res.ok) {
      const data = (await res.json()) as EmergencyAlertResult;
      return {
        ...data,
        location: data.location ?? location,
        deliveries: data.deliveries ?? buildFallbackDeliveries(data.message),
      };
    }

    if (res.status === 401) {
      return buildFallbackResult(
        "Not logged in — showing UI simulation with your GPS location. Log in and configure Twilio/SMTP for real alerts.",
        location
      );
    }

    throw new Error(`Alert failed (${res.status})`);
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("Alert failed")) {
      throw err;
    }
    return buildFallbackResult(
      "API offline — showing client-side simulation with live geolocation. Start npm run dev for backend delivery.",
      location
    );
  }
}
