import bcrypt from "bcryptjs";
import { connectDatabase } from "../config/database.js";
import { User } from "../models/User.js";
import { Doctor } from "../models/Doctor.js";
import { Patient } from "../models/Patient.js";
import { Medicine } from "../models/Clinical.js";
import { Notification } from "../models/Clinical.js";
import { Pharmacy, PharmacyInventory } from "../models/Pharmacy.js";
import { BloodStock, Donor } from "../models/BloodBank.js";
import { initialsFromName } from "../utils/jwt.js";

const medicines = [
  {
    barcode: "8901234567890",
    name: "Paracetamol 500mg",
    genericName: "Acetaminophen",
    dosage: "500mg — 1 tablet every 6 hours (max 4/day)",
    manufacturer: "MediPharm Labs",
    expiry: "2027-03-15",
    warnings: ["Do not exceed recommended dose", "Avoid alcohol while taking"],
    description: "Pain reliever and fever reducer.",
  },
  {
    barcode: "8901234567891",
    name: "Amoxicillin 250mg",
    genericName: "Amoxicillin",
    dosage: "250mg — 1 capsule three times daily for 7 days",
    manufacturer: "HealthCore Pharma",
    expiry: "2026-11-20",
    warnings: ["Complete full antibiotic course"],
    description: "Antibiotic for bacterial infections.",
  },
  {
    barcode: "8901234567892",
    name: "Omeprazole 20mg",
    genericName: "Omeprazole",
    dosage: "20mg — 1 capsule before breakfast",
    manufacturer: "GastroMed Inc.",
    expiry: "2025-01-08",
    warnings: ["Long-term use requires medical supervision"],
    description: "Proton pump inhibitor for acid reflux.",
  },
  {
    barcode: "8901234567893",
    name: "Metformin 500mg",
    genericName: "Metformin HCl",
    dosage: "500mg — 1 tablet twice daily with meals",
    manufacturer: "DiabetesCare Ltd.",
    expiry: "2026-06-15",
    warnings: ["Monitor blood sugar regularly"],
    description: "Oral diabetes medicine.",
  },
  {
    barcode: "PATIENT-QR-001",
    name: "Patient ID QR",
    genericName: "Alex Rivera",
    dosage: "N/A",
    manufacturer: "MediNova Registry",
    expiry: "2099-12-31",
    warnings: [],
    description: "Demo patient QR identifier.",
  },
];

const doctors = [
  {
    name: "Dr. Priya Nair",
    email: "doctor@medinova.ai",
    specialty: "General",
    hospital: "City General Hospital",
    experience: 12,
    rating: 4.9,
    reviews: 248,
    patients: 1240,
    availability: "available" as const,
    schedule: [{ day: "Mon-Fri", slots: ["Today, 2:30 PM", "Tomorrow, 10:00 AM"] }],
    avatarInitials: "PN",
  },
  {
    name: "Dr. Marcus Chen",
    email: "mchen@medinova.ai",
    specialty: "Cardiology",
    hospital: "Heart & Vascular Institute",
    experience: 15,
    rating: 4.8,
    reviews: 189,
    patients: 980,
    availability: "busy" as const,
    schedule: [{ day: "Mon-Fri", slots: ["Tomorrow, 10:00 AM"] }],
    avatarInitials: "MC",
  },
  {
    name: "Dr. Elena Rodriguez",
    email: "erodriguez@medinova.ai",
    specialty: "Neurology",
    hospital: "NeuroCare Medical Center",
    experience: 18,
    rating: 4.95,
    reviews: 312,
    patients: 1560,
    availability: "available" as const,
    schedule: [{ day: "Mon-Fri", slots: ["Today, 4:00 PM"] }],
    avatarInitials: "ER",
  },
];

async function seed() {
  await connectDatabase();
  console.log("Seeding database...");

  await Medicine.deleteMany({});
  await Medicine.insertMany(medicines);
  console.log(`Seeded ${medicines.length} medicines`);

  await Doctor.deleteMany({});
  await Doctor.insertMany(doctors);
  console.log(`Seeded ${doctors.length} doctors`);

  const password = await bcrypt.hash("demo123", 12);
  const demoUsers = [
    {
      name: "Alex Rivera",
      email: "patient@medinova.ai",
      role: "patient" as const,
      age: 32,
      gender: "Male",
    },
    {
      name: "Dr. Priya Nair",
      email: "doctor@medinova.ai",
      role: "doctor" as const,
    },
    {
      name: "Admin User",
      email: "admin@medinova.ai",
      role: "admin" as const,
    },
  ];

  for (const u of demoUsers) {
    await User.findOneAndUpdate(
      { email: u.email },
      {
        ...u,
        password,
        avatarInitials: initialsFromName(u.name),
        isEmailVerified: true,
        medicalData: {
          bloodType: "O+",
          allergies: ["Penicillin"],
          conditions: ["Hypertension monitoring"],
        },
      },
      { upsert: true, new: true }
    );
  }
  console.log("Seeded demo users (password: demo123)");

  const admin = await User.findOne({ email: "admin@medinova.ai" });
  if (admin) {
    await Patient.deleteMany({});
    await Patient.insertMany([
      {
        managedBy: admin._id,
        name: "Alex Rivera",
        age: 32,
        gender: "Male",
        condition: "Hypertension monitoring",
        status: "stable",
        healthScore: 82,
        doctorName: "Dr. Priya Nair",
        avatarInitials: "AR",
        lastVisit: "2026-05-18",
      },
      {
        managedBy: admin._id,
        name: "Maria Santos",
        age: 45,
        gender: "Female",
        condition: "Type 2 Diabetes",
        status: "monitoring",
        healthScore: 74,
        doctorName: "Dr. Marcus Chen",
        avatarInitials: "MS",
        lastVisit: "2026-05-20",
      },
      {
        managedBy: admin._id,
        name: "Robert Williams",
        age: 67,
        gender: "Male",
        condition: "Cardiac arrhythmia",
        status: "critical",
        healthScore: 52,
        doctorName: "Dr. Marcus Chen",
        avatarInitials: "RW",
        lastVisit: "2026-05-21",
      },
    ]);
    console.log("Seeded patients");
  }

  await Pharmacy.deleteMany({});
  const pharmacyDocs = await Pharmacy.insertMany([
    {
      name: "MediCare Pharmacy",
      address: "123 Health Street",
      city: "Metro City",
      phone: "+1-555-0101",
      lat: 40.7128,
      lng: -74.006,
      is24Hours: true,
      isEmergency: true,
      rating: 4.8,
      openHours: "24/7",
    },
    {
      name: "City General Pharmacy",
      address: "456 Medical Ave",
      city: "Metro City",
      phone: "+1-555-0102",
      lat: 40.715,
      lng: -74.01,
      is24Hours: false,
      isEmergency: true,
      rating: 4.5,
      openHours: "8:00 AM - 10:00 PM",
    },
    {
      name: "Wellness Plus Pharmacy",
      address: "789 Wellness Blvd",
      city: "Metro City",
      phone: "+1-555-0103",
      lat: 40.72,
      lng: -74.0,
      is24Hours: false,
      isEmergency: false,
      rating: 4.6,
      openHours: "9:00 AM - 9:00 PM",
    },
  ]);
  console.log(`Seeded ${pharmacyDocs.length} pharmacies`);

  await PharmacyInventory.deleteMany({});
  const inventoryItems = [];
  for (const pharmacy of pharmacyDocs) {
    for (const med of medicines) {
      inventoryItems.push({
        pharmacyId: pharmacy._id,
        medicineName: med.name,
        genericName: med.genericName,
        stock: Math.floor(Math.random() * 50) + 5,
        price: Math.round((Math.random() * 20 + 5) * 100) / 100,
        unit: "tablet",
        expiryDate: med.expiry,
        requiresPrescription: med.name.includes("Amoxicillin"),
        category: med.name.includes("Metformin") ? "diabetes" : "general",
      });
    }
  }
  await PharmacyInventory.insertMany(inventoryItems);
  console.log(`Seeded ${inventoryItems.length} pharmacy inventory items`);

  await BloodStock.deleteMany({});
  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const hospitals = [
    { name: "City General Hospital", lat: 40.713, lng: -74.005 },
    { name: "Heart & Vascular Institute", lat: 40.716, lng: -74.008 },
    { name: "NeuroCare Medical Center", lat: 40.718, lng: -74.002 },
  ];
  const bloodStocks = [];
  for (const hospital of hospitals) {
    for (const bg of bloodGroups) {
      bloodStocks.push({
        bloodGroup: bg,
        units: Math.floor(Math.random() * 30) + 2,
        location: hospital.name,
        hospitalName: hospital.name,
        lat: hospital.lat,
        lng: hospital.lng,
        isRare: ["AB-", "B-", "A-"].includes(bg),
        lastUpdated: new Date(),
      });
    }
  }
  await BloodStock.insertMany(bloodStocks);
  console.log(`Seeded ${bloodStocks.length} blood stock records`);

  await Donor.deleteMany({});
  await Donor.insertMany([
    {
      name: "Sarah Johnson",
      email: "sarah.donor@example.com",
      phone: "+1-555-0201",
      bloodGroup: "O+",
      city: "Metro City",
      isAvailable: true,
      rewardPoints: 350,
      qrCodeId: "DONOR-SJ001",
    },
    {
      name: "Michael Brown",
      email: "mbrown.donor@example.com",
      phone: "+1-555-0202",
      bloodGroup: "A+",
      city: "Metro City",
      isAvailable: true,
      rewardPoints: 280,
      qrCodeId: "DONOR-MB002",
    },
    {
      name: "Emily Davis",
      email: "edavis.donor@example.com",
      phone: "+1-555-0203",
      bloodGroup: "B-",
      city: "Metro City",
      isAvailable: true,
      rewardPoints: 420,
      qrCodeId: "DONOR-ED003",
    },
  ]);
  console.log("Seeded donors");

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
