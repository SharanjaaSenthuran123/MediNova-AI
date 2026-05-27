import type { IPharmacy } from "../models/Pharmacy.js";
import type { IPharmacyInventory } from "../models/Pharmacy.js";

type PopulatedInventory = IPharmacyInventory & {
  pharmacyId: IPharmacy | { _id: unknown };
};

export function toPharmacyDto(pharmacy: IPharmacy) {
  return {
    _id: pharmacy._id.toString(),
    name: pharmacy.name,
    address: pharmacy.address,
    city: pharmacy.city,
    phone: pharmacy.phone,
    email: pharmacy.email,
    lat: pharmacy.lat,
    lng: pharmacy.lng,
    is24Hours: pharmacy.is24Hours,
    isEmergency: pharmacy.isEmergency,
    rating: pharmacy.rating,
    openHours: pharmacy.openHours,
  };
}

export function toInventoryResult(item: PopulatedInventory) {
  const pharmacyDoc = item.pharmacyId;
  const pharmacy =
    pharmacyDoc &&
    typeof pharmacyDoc === "object" &&
    "name" in pharmacyDoc &&
    pharmacyDoc.name
      ? toPharmacyDto(pharmacyDoc as IPharmacy)
      : null;

  return {
    id: item._id.toString(),
    medicineName: item.medicineName,
    genericName: item.genericName,
    stock: item.stock,
    price: item.price,
    unit: item.unit,
    expiryDate: item.expiryDate,
    requiresPrescription: item.requiresPrescription,
    category: item.category,
    pharmacy,
    pharmacyId: pharmacy?._id ?? String(pharmacyDoc),
    inStock: item.stock > 0,
  };
}
