export const APP_NAME = "MediNova-AI";
export const APP_TAGLINE = "AI Powered Smart Healthcare Ecosystem";
export const APP_DESCRIPTION =
  "One connected platform for AI symptom guidance, prescription OCR, smart medicine scanning, emergency SOS simulation, and health analytics — built for hackathon demos and real-world healthcare UX.";

export const NAV_LINKS = [
  { href: "/home", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/doctors", label: "Doctors" },
  { href: "/symptom-checker", label: "Symptoms" },
] as const;

export const NAV_MENU_LINKS = [
  { href: "/patients", label: "Patients" },
  { href: "/health-analytics", label: "Analytics" },
  { href: "/emergency", label: "Emergency SOS" },
] as const;

export const SIDEBAR_LINKS = [
  { href: "/home", label: "Home", icon: "Home" },
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/symptom-checker", label: "AI Symptom Checker", icon: "Stethoscope" },
  { href: "/patients", label: "Patients", icon: "Users" },
  { href: "/doctors", label: "Doctors", icon: "UserRound" },
  { href: "/appointments", label: "Appointments", icon: "Calendar" },
  { href: "/prescription-reader", label: "Prescriptions", icon: "FileText" },
  { href: "/barcode-scanner", label: "Smart Medicine Scanner", icon: "ScanBarcode" },
  { href: "/emergency", label: "Emergency Alerts", icon: "Siren" },
  { href: "/health-analytics", label: "Health Analytics", icon: "LineChart" },
  { href: "/nutrition", label: "AI Nutrition", icon: "Apple" },
  { href: "/pharmacy", label: "Online Pharmacy", icon: "Pill" },
  { href: "/blood-bank", label: "Blood Bank", icon: "Droplet" },
  { href: "/payments", label: "Payments", icon: "CreditCard" },
  { href: "/admin", label: "Admin", icon: "Shield", adminOnly: true },
  { href: "/health-tips", label: "Health Tips", icon: "Lightbulb" },
  { href: "/nearby", label: "Nearby Care", icon: "MapPin" },
  { href: "/reports", label: "Reports", icon: "ClipboardList" },
  { href: "/assistant", label: "AI Assistant", icon: "MessageSquare" },
  { href: "/reminders", label: "Reminders", icon: "Bell" },
  { href: "/history", label: "History", icon: "History" },
  { href: "/settings", label: "Settings", icon: "Settings" },
  { href: "/profile", label: "Profile", icon: "UserCircle" },
] as const;

export const MOBILE_NAV_LINKS = [
  { href: "/home", label: "Home", icon: "Home" },
  { href: "/dashboard", label: "Dash", icon: "LayoutDashboard" },
  { href: "/symptom-checker", label: "Symptoms", icon: "Stethoscope" },
  { href: "/emergency", label: "SOS", icon: "Siren" },
] as const;
