import type { LucideIcon } from "lucide-react";

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  rating: number;
  reviews: number;
  experience: number;
  availability: "available" | "busy" | "offline";
  nextSlot: string;
  avatarInitials: string;
  patients: number;
}

export const doctorSpecialties = [
  "All",
  "Cardiology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "Dermatology",
  "General",
] as const;

export const doctors: Doctor[] = [
  {
    id: "d1",
    name: "Dr. Priya Nair",
    specialty: "General",
    hospital: "City General Hospital",
    rating: 4.9,
    reviews: 248,
    experience: 12,
    availability: "available",
    nextSlot: "Today, 2:30 PM",
    avatarInitials: "PN",
    patients: 1240,
  },
  {
    id: "d2",
    name: "Dr. Marcus Chen",
    specialty: "Cardiology",
    hospital: "Heart & Vascular Institute",
    rating: 4.8,
    reviews: 189,
    experience: 15,
    availability: "busy",
    nextSlot: "Tomorrow, 10:00 AM",
    avatarInitials: "MC",
    patients: 980,
  },
  {
    id: "d3",
    name: "Dr. Elena Rodriguez",
    specialty: "Neurology",
    hospital: "NeuroCare Medical Center",
    rating: 4.95,
    reviews: 312,
    experience: 18,
    availability: "available",
    nextSlot: "Today, 4:00 PM",
    avatarInitials: "ER",
    patients: 1560,
  },
  {
    id: "d4",
    name: "Dr. James Okonkwo",
    specialty: "Pediatrics",
    hospital: "Children's Health Clinic",
    rating: 4.85,
    reviews: 156,
    experience: 10,
    availability: "available",
    nextSlot: "Today, 11:30 AM",
    avatarInitials: "JO",
    patients: 2100,
  },
  {
    id: "d5",
    name: "Dr. Sarah Kim",
    specialty: "Dermatology",
    hospital: "Skin & Wellness Center",
    rating: 4.7,
    reviews: 98,
    experience: 8,
    availability: "offline",
    nextSlot: "Mon, 9:00 AM",
    avatarInitials: "SK",
    patients: 640,
  },
  {
    id: "d6",
    name: "Dr. Ahmed Hassan",
    specialty: "Orthopedics",
    hospital: "Motion Orthopedic Group",
    rating: 4.88,
    reviews: 201,
    experience: 14,
    availability: "busy",
    nextSlot: "Tomorrow, 3:00 PM",
    avatarInitials: "AH",
    patients: 870,
  },
];

export interface PatientRecord {
  id: string;
  name: string;
  age: number;
  gender: string;
  condition: string;
  status: "stable" | "monitoring" | "critical";
  lastVisit: string;
  doctor: string;
  healthScore: number;
  avatarInitials: string;
}

export const patients: PatientRecord[] = [
  {
    id: "p1",
    name: "Alex Rivera",
    age: 32,
    gender: "Male",
    condition: "Hypertension monitoring",
    status: "stable",
    lastVisit: "May 18, 2026",
    doctor: "Dr. Priya Nair",
    healthScore: 82,
    avatarInitials: "AR",
  },
  {
    id: "p2",
    name: "Maria Santos",
    age: 45,
    gender: "Female",
    condition: "Type 2 Diabetes",
    status: "monitoring",
    lastVisit: "May 20, 2026",
    doctor: "Dr. Marcus Chen",
    healthScore: 74,
    avatarInitials: "MS",
  },
  {
    id: "p3",
    name: "David Thompson",
    age: 58,
    gender: "Male",
    condition: "Post-surgery recovery",
    status: "monitoring",
    lastVisit: "May 19, 2026",
    doctor: "Dr. Ahmed Hassan",
    healthScore: 68,
    avatarInitials: "DT",
  },
  {
    id: "p4",
    name: "Emily Chen",
    age: 28,
    gender: "Female",
    condition: "Migraine management",
    status: "stable",
    lastVisit: "May 15, 2026",
    doctor: "Dr. Elena Rodriguez",
    healthScore: 88,
    avatarInitials: "EC",
  },
  {
    id: "p5",
    name: "Robert Williams",
    age: 67,
    gender: "Male",
    condition: "Cardiac arrhythmia",
    status: "critical",
    lastVisit: "May 21, 2026",
    doctor: "Dr. Marcus Chen",
    healthScore: 52,
    avatarInitials: "RW",
  },
];

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  avatarInitials: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Sarah Mitchell",
    role: "Patient",
    quote:
      "MediNova's AI symptom checker helped me understand my symptoms before my appointment. The reminders and health analytics keep me on track.",
    rating: 5,
    avatarInitials: "SM",
  },
  {
    id: "t2",
    name: "Dr. James Liu",
    role: "Cardiologist",
    quote:
      "The analytics dashboard gives me real-time patient insights. Prescription OCR has cut documentation time in half.",
    rating: 5,
    avatarInitials: "JL",
  },
  {
    id: "t3",
    name: "Hospital Admin",
    role: "Metro Health System",
    quote:
      "Enterprise-grade security with a beautiful UX. Our staff adopted it within days. Best healthcare platform we've evaluated.",
    rating: 5,
    avatarInitials: "MH",
  },
];

export interface LiveStat {
  label: string;
  value: string;
  change: string;
  icon: string;
}

export const liveHealthStats: LiveStat[] = [
  { label: "Active Patients", value: "12,847", change: "+8.2%", icon: "Users" },
  { label: "Appointments Today", value: "342", change: "+12%", icon: "Calendar" },
  { label: "AI Diagnoses", value: "1,204", change: "+24%", icon: "Brain" },
  { label: "Emergency Response", value: "98.7%", change: "SLA met", icon: "Ambulance" },
];
