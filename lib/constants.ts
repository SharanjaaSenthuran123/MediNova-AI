export const APP_NAME = "MediNova-AI";
export const APP_TAGLINE = "AI Powered Smart Healthcare Ecosystem";
export const APP_DESCRIPTION =
  "Understand symptoms, read prescriptions, verify medicines, monitor health, and access emergency assistance — all in one modern healthcare dashboard.";

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/#features", label: "Features" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/symptom-checker", label: "Symptom Checker" },
  { href: "/emergency", label: "Emergency" },
] as const;

export const SIDEBAR_LINKS = [
  { href: "/dashboard", label: "Overview", icon: "LayoutDashboard" },
  { href: "/symptom-checker", label: "Symptom Checker", icon: "Stethoscope" },
  { href: "/prescription-reader", label: "Prescription Reader", icon: "FileText" },
  { href: "/barcode-scanner", label: "Barcode Scanner", icon: "ScanBarcode" },
  { href: "/emergency", label: "Emergency SOS", icon: "Siren" },
  { href: "/reports", label: "Reports", icon: "ClipboardList" },
] as const;
