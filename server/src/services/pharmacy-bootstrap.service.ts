import { PHARMACY_CATALOG, PHARMACY_MEDICINES } from "../data/pharmacy-catalog.js";
import { Pharmacy, PharmacyInventory } from "../models/Pharmacy.js";
import { MedicineCatalog, DeliveryAgent } from "../models/Order.js";
import { BloodStock, Donor } from "../models/BloodBank.js";

let bootstrapPromise: Promise<void> | null = null;

export function ensurePharmacyBootstrap(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = runBootstrap().catch((err) => {
      bootstrapPromise = null;
      throw err;
    });
  }
  return bootstrapPromise;
}

async function runBootstrap() {
  const pharmacyCount = await Pharmacy.countDocuments();
  if (pharmacyCount === 0) {
    console.log("Bootstrapping pharmacies and medicine catalog...");
    const pharmacyDocs = await Pharmacy.insertMany([...PHARMACY_CATALOG]);

    const legacyInventory = pharmacyDocs.flatMap((pharmacy, pi) =>
      PHARMACY_MEDICINES.map((med, mi) => ({
        pharmacyId: pharmacy._id,
        medicineName: med.name,
        genericName: med.genericName,
        stock: 12 + ((pi + mi) * 7) % 40,
        price: Math.round((8 + ((pi + mi) * 3) % 15)) + 0.99,
        unit: "tablet",
        expiryDate: med.expiry,
        requiresPrescription: med.requiresPrescription,
        category: med.category,
      }))
    );
    await PharmacyInventory.insertMany(legacyInventory);

    const catalog = pharmacyDocs.flatMap((pharmacy, pi) =>
      PHARMACY_MEDICINES.map((med, mi) => ({
        name: med.name,
        genericName: med.genericName,
        stock: 12 + ((pi + mi) * 7) % 40,
        price: Math.round((8 + ((pi + mi) * 3) % 15)) + 0.99,
        category: med.category,
        expiryDate: med.expiry,
        pharmacyId: pharmacy._id,
        description: med.genericName ? `Generic: ${med.genericName}` : undefined,
        dosageInfo: "Follow prescriber or package instructions",
        requiresPrescription: med.requiresPrescription,
      }))
    );
    await MedicineCatalog.insertMany(catalog);

    await DeliveryAgent.insertMany([
      { name: "Alex Courier", phone: "+94-77-555-0301", lat: 6.926, lng: 79.86, isAvailable: true, vehicleType: "motorcycle" },
      { name: "Jordan Express", phone: "+94-77-555-0302", lat: 6.93, lng: 79.865, isAvailable: true, vehicleType: "van" },
      { name: "Sam Rapid", phone: "+94-77-555-0303", lat: 6.924, lng: 79.855, isAvailable: true, vehicleType: "motorcycle" },
    ]);

    console.log(`  Bootstrapped ${pharmacyDocs.length} pharmacies, ${catalog.length} medicines, 3 delivery agents`);
  }

  const catalogCount = await MedicineCatalog.countDocuments();
  if (catalogCount === 0 && pharmacyCount > 0) {
    const pharmacies = await Pharmacy.find();
    const catalog = pharmacies.flatMap((pharmacy, pi) =>
      PHARMACY_MEDICINES.map((med, mi) => ({
        name: med.name,
        genericName: med.genericName,
        stock: 20 + ((pi + mi) * 5) % 30,
        price: 9.99 + ((pi + mi) % 10),
        category: med.category,
        expiryDate: med.expiry,
        pharmacyId: pharmacy._id,
        dosageInfo: "As directed",
        requiresPrescription: med.requiresPrescription,
      }))
    );
    await MedicineCatalog.insertMany(catalog);
    console.log(`  Synced ${catalog.length} medicine catalog entries`);
  }

  const agentCount = await DeliveryAgent.countDocuments();
  if (agentCount === 0) {
    await DeliveryAgent.insertMany([
      { name: "Alex Courier", phone: "+1-555-0301", lat: 40.714, lng: -74.004, isAvailable: true, vehicleType: "motorcycle" },
      { name: "Jordan Express", phone: "+1-555-0302", lat: 40.716, lng: -74.008, isAvailable: true, vehicleType: "van" },
    ]);
  }

  const bloodCount = await BloodStock.countDocuments();
  if (bloodCount === 0) {
    const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    const hospitals = [
      { name: "City General Hospital", lat: 40.713, lng: -74.005 },
      { name: "Heart & Vascular Institute", lat: 40.716, lng: -74.008 },
    ];
    const stocks = hospitals.flatMap((h) =>
      bloodGroups.map((bg) => ({
        bloodGroup: bg,
        units: 10 + Math.floor(Math.random() * 20),
        location: h.name,
        hospitalName: h.name,
        lat: h.lat,
        lng: h.lng,
        isRare: ["AB-", "B-", "A-"].includes(bg),
        lastUpdated: new Date(),
      }))
    );
    await BloodStock.insertMany(stocks);
  }

  const donorCount = await Donor.countDocuments();
  if (donorCount === 0) {
    await Donor.insertMany([
      { name: "Sarah Johnson", email: "sarah.donor@medinova.ai", phone: "+1-555-0201", bloodGroup: "O+", city: "Metro City", lat: 40.715, lng: -74.003, isAvailable: true, rewardPoints: 350, qrCodeId: "DONOR-SJ001" },
      { name: "Michael Brown", email: "mbrown.donor@medinova.ai", phone: "+1-555-0202", bloodGroup: "A+", city: "Metro City", lat: 40.717, lng: -74.006, isAvailable: true, rewardPoints: 280, qrCodeId: "DONOR-MB002" },
    ]);
  }
}
