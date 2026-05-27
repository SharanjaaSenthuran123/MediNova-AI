import { Router } from "express";
import { z } from "zod";
import { Medicine } from "../models/Clinical.js";
import { optionalAuth } from "../middleware/auth.js";

const router = Router();

async function lookupBarcode(barcode: string, res: import("express").Response) {
  if (!barcode) return res.status(400).json({ error: "Invalid barcode" });

  const medicine = await Medicine.findOne({ barcode });
  if (!medicine) {
    return res.status(404).json({ error: "Medicine not found", barcode });
  }

  return res.json({
    medicine: {
      barcode: medicine.barcode,
      name: medicine.name,
      genericName: medicine.genericName,
      dosage: medicine.dosage,
      manufacturer: medicine.manufacturer,
      expiry: medicine.expiry,
      warnings: medicine.warnings,
      description: medicine.description,
    },
  });
}

router.get("/", optionalAuth, async (req, res) => {
  const barcode = String(req.query.barcode ?? "");
  return lookupBarcode(barcode, res);
});

router.post("/", optionalAuth, async (req, res) => {
  const schema = z.object({ barcode: z.string().min(1).max(50) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid barcode" });
  return lookupBarcode(parsed.data.barcode, res);
});

export default router;
