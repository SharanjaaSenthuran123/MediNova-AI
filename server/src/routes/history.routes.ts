import { Router } from "express";
import {
  MedicineScan,
  Prescription,
  SymptomRecord,
} from "../models/Clinical.js";
import type { AuthRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
  const type = String(req.query.type ?? "all");
  const userId = req.user!._id;

  const [symptoms, prescriptions, barcodes] = await Promise.all([
    type === "all" || type === "symptoms"
      ? SymptomRecord.find({ userId }).sort({ createdAt: -1 }).limit(50)
      : [],
    type === "all" || type === "prescriptions"
      ? Prescription.find({ userId }).sort({ createdAt: -1 }).limit(50)
      : [],
    type === "all" || type === "barcodes"
      ? MedicineScan.find({ userId }).sort({ createdAt: -1 }).limit(50)
      : [],
  ]);

  return res.json({
    symptoms: symptoms.map((s) => ({
      id: s._id.toString(),
      userId: s.userId.toString(),
      createdAt: s.createdAt.toISOString(),
      input: s.input,
      result: s.result,
    })),
    prescriptions: prescriptions.map((p) => ({
      id: p._id.toString(),
      userId: p.userId.toString(),
      createdAt: p.createdAt.toISOString(),
      medicines: p.medicines,
      rawTextPreview: p.rawTextPreview,
      source: p.source,
    })),
    barcodes: barcodes.map((b) => ({
      id: b._id.toString(),
      userId: b.userId.toString(),
      createdAt: b.createdAt.toISOString(),
      barcode: b.barcode,
      medicineName: b.medicineName,
      expiry: b.expiry,
      found: b.found,
      scanType: b.scanType,
    })),
  });
  })
);

router.post(
  "/symptoms",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const entry = await SymptomRecord.create({
      userId: req.user!._id,
      input: req.body.input ?? req.body,
      result: req.body.result ?? {},
    });
    return res.json({
      entry: {
        id: entry._id.toString(),
        userId: entry.userId.toString(),
        createdAt: entry.createdAt.toISOString(),
        input: entry.input,
        result: entry.result,
      },
    });
  })
);

router.post(
  "/prescriptions",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const entry = await Prescription.create({
      userId: req.user!._id,
      medicines: req.body.medicines ?? [],
      rawTextPreview: req.body.rawTextPreview ?? "",
      source: req.body.source ?? "ocr",
    });
    return res.json({
      entry: {
        id: entry._id.toString(),
        userId: entry.userId.toString(),
        createdAt: entry.createdAt.toISOString(),
        medicines: entry.medicines,
        rawTextPreview: entry.rawTextPreview,
        source: entry.source,
      },
    });
  })
);

router.post(
  "/barcodes",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const entry = await MedicineScan.create({
      userId: req.user!._id,
      barcode: req.body.barcode,
      medicineName: req.body.medicineName ?? "Unknown",
      expiry: req.body.expiry,
      found: req.body.found ?? true,
      scanType: req.body.scanType ?? "barcode",
    });
    return res.json({
      entry: {
        id: entry._id.toString(),
        userId: entry.userId.toString(),
        createdAt: entry.createdAt.toISOString(),
        barcode: entry.barcode,
        medicineName: entry.medicineName,
        expiry: entry.expiry,
        found: entry.found,
      },
    });
  })
);

export default router;
