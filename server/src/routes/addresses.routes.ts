import { Router } from "express";
import { z } from "zod";
import { SavedAddress } from "../models/PharmacyExtras.js";
import type { AuthRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { isWithinDeliveryRadius, MAX_DELIVERY_RADIUS_KM } from "../services/eta.service.js";
import { Pharmacy } from "../models/Pharmacy.js";

const router = Router();

function toDto(addr: InstanceType<typeof SavedAddress>) {
  return {
    id: addr._id.toString(),
    label: addr.label,
    customLabel: addr.customLabel,
    address: addr.address,
    lat: addr.lat,
    lng: addr.lng,
    isDefault: addr.isDefault,
  };
}

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const addresses = await SavedAddress.find({ userId: req.user!._id }).sort({
      isDefault: -1,
      updatedAt: -1,
    });
    return res.json({ addresses: addresses.map(toDto), maxDeliveryRadiusKm: MAX_DELIVERY_RADIUS_KM });
  })
);

router.post(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const schema = z.object({
      label: z.enum(["home", "work", "other"]).default("home"),
      customLabel: z.string().optional(),
      address: z.string().min(3),
      lat: z.number(),
      lng: z.number(),
      isDefault: z.boolean().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid address" });

    if (parsed.data.isDefault) {
      await SavedAddress.updateMany({ userId: req.user!._id }, { isDefault: false });
    }

    const count = await SavedAddress.countDocuments({ userId: req.user!._id });
    const addr = await SavedAddress.create({
      userId: req.user!._id,
      ...parsed.data,
      isDefault: parsed.data.isDefault ?? count === 0,
    });

    return res.status(201).json({ address: toDto(addr) });
  })
);

router.patch(
  "/:id",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const addr = await SavedAddress.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!addr) return res.status(404).json({ error: "Address not found" });

    if (req.body.isDefault) {
      await SavedAddress.updateMany({ userId: req.user!._id }, { isDefault: false });
      addr.isDefault = true;
    }
    if (req.body.label) addr.label = req.body.label;
    if (req.body.customLabel !== undefined) addr.customLabel = req.body.customLabel;
    if (req.body.address) addr.address = req.body.address;
    if (typeof req.body.lat === "number") addr.lat = req.body.lat;
    if (typeof req.body.lng === "number") addr.lng = req.body.lng;
    await addr.save();

    return res.json({ address: toDto(addr) });
  })
);

router.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const addr = await SavedAddress.findOneAndDelete({
      _id: req.params.id,
      userId: req.user!._id,
    });
    if (!addr) return res.status(404).json({ error: "Address not found" });
    return res.json({ ok: true });
  })
);

router.post(
  "/check-delivery",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const schema = z.object({ lat: z.number(), lng: z.number(), pharmacyId: z.string().optional() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid coordinates" });

    const pharmacies = parsed.data.pharmacyId
      ? await Pharmacy.find({ _id: parsed.data.pharmacyId })
      : await Pharmacy.find();

    const deliverable = pharmacies.filter((p) =>
      isWithinDeliveryRadius(parsed.data.lat, parsed.data.lng, p.lat, p.lng)
    );

    return res.json({
      deliverable: deliverable.length > 0,
      maxRadiusKm: MAX_DELIVERY_RADIUS_KM,
      pharmaciesInRange: deliverable.length,
      nearestPharmacy: deliverable[0]?.name ?? null,
    });
  })
);

export default router;
