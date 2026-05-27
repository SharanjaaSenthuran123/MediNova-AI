import { MedicineCatalog } from "../models/Order.js";
import { PharmacyInventory } from "../models/Pharmacy.js";

/** Keeps legacy PharmacyInventory stock aligned with MedicineCatalog after orders. */
export async function syncInventoryFromCatalog(catalogId: string, stock: number) {
  const med = await MedicineCatalog.findById(catalogId);
  if (!med) return;

  await PharmacyInventory.findOneAndUpdate(
    { pharmacyId: med.pharmacyId, medicineName: med.name },
    { stock, price: med.price }
  );
}

export async function restoreCatalogStock(catalogId: string, quantity: number) {
  const med = await MedicineCatalog.findByIdAndUpdate(
    catalogId,
    { $inc: { stock: quantity } },
    { new: true }
  );
  if (med) {
    await syncInventoryFromCatalog(catalogId, med.stock);
    return med;
  }
  return null;
}
