import type { FeatureItem } from "@/types/health";

/** Five core demo features shown on the landing page. */
export const homepageFeatures: FeatureItem[] = [
  {
    title: "AI Symptom Checker",
    description:
      "Describe symptoms and get AI-assisted possible conditions, self-care tips, and urgency guidance — the star of your demo.",
    icon: "Stethoscope",
    href: "/symptom-checker",
    badge: "Main AI Feature",
  },
  {
    title: "Prescription OCR Reader",
    description:
      "Upload a prescription photo and extract medicine names with browser-based Tesseract.js OCR.",
    icon: "FileText",
    href: "/prescription-reader",
    badge: "OCR Ready",
  },
  {
    title: "Smart Medicine Scanner",
    description:
      "Upload a medicine photo or enter a barcode for AI vision analysis — dosage, warnings, expiry, and manufacturer details.",
    icon: "ScanBarcode",
    href: "/barcode-scanner",
  },
  {
    title: "Emergency SOS",
    description:
      "Trigger a realistic alert simulation with location sharing, caretaker notification, and SMS/email timeline.",
    icon: "Siren",
    href: "/emergency",
    badge: "Simulation",
  },
  {
    title: "Health Dashboard",
    description:
      "Monitor heart rate, sleep, medicine adherence, and reports in a Chart.js analytics control center.",
    icon: "LayoutDashboard",
    href: "/dashboard",
  },
];

export const trustStripItems = [
  {
    label: "AI-assisted",
    description: "OpenAI symptom guidance with demo fallback",
    icon: "Sparkles",
  },
  {
    label: "OCR ready",
    description: "Tesseract.js prescription extraction",
    icon: "FileText",
  },
  {
    label: "Emergency simulation",
    description: "SOS timeline with caretaker alerts",
    icon: "Siren",
  },
  {
    label: "Dashboard analytics",
    description: "Chart.js vitals and medicine tracking",
    icon: "LayoutDashboard",
  },
] as const;

export const howItWorksSteps = [
  {
    step: "01",
    title: "Enter health data",
    description:
      "Describe symptoms, upload a prescription, or use the Smart Medicine Scanner — all from one app.",
  },
  {
    step: "02",
    title: "AI analyzes & extracts",
    description:
      "OpenAI suggests possible conditions; OCR and Smart Medicine Scanner surface medicine details.",
  },
  {
    step: "03",
    title: "Get clear guidance",
    description:
      "Review urgency levels, self-care tips, warnings, and when to seek professional help.",
  },
  {
    step: "04",
    title: "Track on dashboard",
    description:
      "See vitals, sleep, adherence, and AI insights in a connected healthcare control center.",
  },
];

export const heroQuickLinks = [
  { label: "Try OCR Reader", href: "/prescription-reader" },
  { label: "Smart Medicine Scanner", href: "/barcode-scanner" },
  { label: "Emergency SOS", href: "/emergency" },
] as const;

/** Animated counters shown below the hero CTAs. */
export const heroStats = [
  { value: 5, suffix: "+", prefix: "", label: "Core healthcare tools" },
  { value: 94, suffix: "%", prefix: "", label: "Medicine adherence demo" },
  { value: 24, suffix: "/7", prefix: "", label: "AI guidance available" },
  { value: 99, suffix: "%", prefix: "", label: "Demo reliability" },
] as const;

export const trustBadges = [
  { label: "Educational demo", icon: "ShieldCheck" },
  { label: "OpenAI powered", icon: "Sparkles" },
  { label: "Privacy-first UX", icon: "Lock" },
  { label: "Mobile ready", icon: "Smartphone" },
] as const;
