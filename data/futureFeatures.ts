export interface FutureFeature {
  title: string;
  description: string;
  icon: string;
  timeline: string;
  href?: string;
  live?: boolean;
}

/** Vision items for homepage roadmap — Phase 12 features marked live where implemented. */
export const futureFeatures: FutureFeature[] = [
  {
    title: "AI Health Assistant",
    description:
      "Conversational follow-ups after symptom checks with context from your latest analysis.",
    icon: "MessageSquare",
    timeline: "Live",
    href: "/assistant",
    live: true,
  },
  {
    title: "Doctor Appointments",
    description:
      "Book, reschedule, and get prep checklists for virtual or in-person visits.",
    icon: "Calendar",
    timeline: "Live",
    href: "/appointments",
    live: true,
  },
  {
    title: "Smart Medicine Reminders",
    description:
      "Push and email alerts tied to prescription OCR and barcode scan history.",
    icon: "Bell",
    timeline: "Live",
    href: "/reminders",
    live: true,
  },
  {
    title: "Wearable & IoT Sync",
    description:
      "Import heart rate, sleep, and activity from Apple Health, Fitbit, or Garmin.",
    icon: "Watch",
    timeline: "Live",
    href: "/dashboard",
    live: true,
  },
  {
    title: "Voice Assistant",
    description:
      "Hands-free symptom logging and emergency triggers for accessibility.",
    icon: "Mic",
    timeline: "2027",
  },
];
