import type { FeatureItem } from "@/types/health";

export const homepageFeatures: FeatureItem[] = [
  {
    title: "AI Symptom Checker",
    description:
      "Enter symptoms and receive AI-assisted possible conditions, basic suggestions, and urgency guidance.",
    icon: "Stethoscope",
    href: "/symptom-checker",
    badge: "Main AI Feature",
  },
  {
    title: "Prescription OCR Reader",
    description:
      "Upload prescription images and extract medicine names with browser-based OCR.",
    icon: "FileText",
    href: "/prescription-reader",
  },
  {
    title: "Medicine Barcode Scanner",
    description:
      "Scan barcodes to view dosage, warnings, and expiry details from a demo medicine database.",
    icon: "ScanBarcode",
    href: "/barcode-scanner",
  },
  {
    title: "Emergency SOS",
    description:
      "Trigger a realistic emergency alert simulation with location and caretaker notification flow.",
    icon: "Siren",
    href: "/emergency",
  },
  {
    title: "Health Dashboard",
    description:
      "Monitor heart rate, sleep, medicine adherence, and health reports in one professional view.",
    icon: "LayoutDashboard",
    href: "/dashboard",
  },
  {
    title: "Privacy-First Design",
    description:
      "Built with a modern healthcare UX and clear safety disclaimers for demo and educational use.",
    icon: "ShieldCheck",
    href: "/dashboard",
  },
];

export const howItWorksSteps = [
  {
    step: "01",
    title: "Describe your symptoms",
    description: "Enter symptoms, duration, and severity in the AI Symptom Checker.",
  },
  {
    step: "02",
    title: "Get AI-assisted insights",
    description: "Review possible conditions, suggestions, and when to seek medical help.",
  },
  {
    step: "03",
    title: "Track your health",
    description: "Use the dashboard for vitals, sleep, medicines, and report summaries.",
  },
  {
    step: "04",
    title: "Stay emergency-ready",
    description: "Access SOS simulation and prescription tools from one connected app.",
  },
];
