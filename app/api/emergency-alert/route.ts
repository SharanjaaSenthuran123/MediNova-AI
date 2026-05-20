import { NextResponse } from "next/server";
import { demoLocation } from "@/data/emergencyContacts";

export async function POST() {
  await new Promise((r) => setTimeout(r, 800));

  return NextResponse.json({
    success: true,
    simulation: true,
    message: "Emergency alert simulation recorded (no real alerts sent).",
    location: demoLocation,
    notified: [
      { type: "caretaker", name: "Sarah Johnson", channel: "sms" },
      { type: "physician", name: "Dr. Michael Chen", channel: "email" },
      { type: "dispatch", name: "City General Hospital", channel: "simulated" },
    ],
  });
}
