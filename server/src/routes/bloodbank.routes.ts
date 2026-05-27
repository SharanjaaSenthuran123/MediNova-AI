import { Router } from "express";
import { z } from "zod";
import type { AuthRequest } from "../middleware/auth.js";
import { optionalAuth, requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createBloodEmergencyRequest,
  donorRespondToRequest,
  registerDonor,
  predictBloodDemand,
} from "../services/blood.service.js";
import {
  BloodRequest,
  Donor,
  BloodStock,
  BloodEmergencyAlert,
  BLOOD_GROUPS,
} from "../models/BloodBank.js";
import { rankByDistance } from "../services/location.service.js";
import { getPriorityQueue } from "../services/order.service.js";

const router = Router();

router.get(
  "/stocks/summary",
  optionalAuth,
  asyncHandler(async (_req, res) => {
    const stocks = await BloodStock.find();
    const summary: Record<string, { units: number; locations: number }> = {};
    for (const s of stocks) {
      if (!summary[s.bloodGroup]) summary[s.bloodGroup] = { units: 0, locations: 0 };
      summary[s.bloodGroup].units += s.units;
      summary[s.bloodGroup].locations += 1;
    }
    return res.json({
      summary: BLOOD_GROUPS.map((bg) => ({
        bloodGroup: bg,
        units: summary[bg]?.units ?? 0,
        locations: summary[bg]?.locations ?? 0,
        isRare: ["AB-", "B-", "A-"].includes(bg),
        status:
          (summary[bg]?.units ?? 0) < 5
            ? "critical"
            : (summary[bg]?.units ?? 0) < 15
              ? "low"
              : "adequate",
      })),
    });
  })
);

router.get(
  "/stocks",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const bloodGroup = req.query.bloodGroup as string | undefined;
    const filter = bloodGroup ? { bloodGroup } : {};
    const stocks = await BloodStock.find(filter);
    return res.json({ stocks });
  })
);

router.post(
  "/requests",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const schema = z.object({
      patientName: z.string(),
      bloodGroup: z.enum(BLOOD_GROUPS),
      unitsNeeded: z.number().min(1),
      hospital: z.string(),
      urgency: z.enum(["normal", "urgent", "critical"]).default("urgent"),
      contactPhone: z.string(),
      contactEmail: z.string().email().optional(),
      lat: z.number(),
      lng: z.number(),
      notes: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid blood request" });

    const result = await createBloodEmergencyRequest({
      userId: req.user!._id.toString(),
      ...parsed.data,
      location: { lat: parsed.data.lat, lng: parsed.data.lng },
    });

    return res.status(201).json({
      request: result.request,
      matchedDonors: result.matchedDonors.map((r) => ({
        donor: r.item,
        distanceKm: r.distanceKm,
      })),
    });
  })
);

router.get(
  "/requests",
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const filter =
      req.user && req.query.mine === "true" ? { userId: req.user._id } : {};
    const requests = await BloodRequest.find(filter).sort({ createdAt: -1 }).limit(50);
    return res.json({ requests });
  })
);

router.post(
  "/requests/:id/respond",
  requireAuth,
  requireRole("donor", "admin"),
  asyncHandler(async (req: AuthRequest, res) => {
    const schema = z.object({ response: z.enum(["accepted", "rejected"]) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid response" });

    const donor = await Donor.findOne({ userId: req.user!._id });
    if (!donor) return res.status(404).json({ error: "Donor profile not found" });

    try {
      const request = await donorRespondToRequest(
        donor._id.toString(),
        req.params.id,
        parsed.data.response
      );
      return res.json({ request });
    } catch (err) {
      return res.status(400).json({
        error: err instanceof Error ? err.message : "Response failed",
      });
    }
  })
);

router.patch(
  "/requests/:id/fulfill",
  requireAuth,
  requireRole("admin", "doctor"),
  asyncHandler(async (req, res) => {
    const request = await BloodRequest.findByIdAndUpdate(
      req.params.id,
      { status: "fulfilled" },
      { new: true }
    );
    if (!request) return res.status(404).json({ error: "Request not found" });

    await BloodEmergencyAlert.updateMany({ requestId: request._id }, { resolved: true });

    if (request.acceptedDonorId) {
      await Donor.findByIdAndUpdate(request.acceptedDonorId, {
        isAvailable: true,
        $inc: { rewardPoints: 50 },
      });
    }

    return res.json({ request });
  })
);

router.post(
  "/donors/register",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const schema = z.object({
      name: z.string(),
      email: z.string().email(),
      phone: z.string(),
      bloodGroup: z.enum(BLOOD_GROUPS),
      city: z.string(),
      lat: z.number(),
      lng: z.number(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid donor data" });

    try {
      const donor = await registerDonor({
        userId: req.user!._id.toString(),
        ...parsed.data,
        location: { lat: parsed.data.lat, lng: parsed.data.lng },
      });
      return res.status(201).json({ donor });
    } catch (err) {
      return res.status(409).json({
        error: err instanceof Error ? err.message : "Registration failed",
      });
    }
  })
);

router.get(
  "/donors",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const bloodGroup = req.query.bloodGroup as string | undefined;
    const filter: Record<string, unknown> = { isAvailable: true };
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    const donors = await Donor.find(filter).sort({ rewardPoints: -1 }).limit(50);
    return res.json({ donors });
  })
);

router.get(
  "/donors/me",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const donor = await Donor.findOne({ userId: req.user!._id });
    return res.json({ donor });
  })
);

router.get(
  "/donors/pending-requests",
  requireAuth,
  requireRole("donor", "admin"),
  asyncHandler(async (req: AuthRequest, res) => {
    const donor = await Donor.findOne({ userId: req.user!._id });
    if (!donor) return res.json({ requests: [] });

    const requests = await BloodRequest.find({
      matchedDonorIds: donor._id,
      status: { $in: ["pending", "matched", "accepted"] },
    }).sort({ createdAt: -1 });

    return res.json({ requests });
  })
);

router.get(
  "/alerts",
  optionalAuth,
  asyncHandler(async (_req, res) => {
    const alerts = await BloodEmergencyAlert.find({ resolved: false })
      .sort({ createdAt: -1 })
      .limit(20);
    return res.json({ alerts });
  })
);

router.get(
  "/priority-queue",
  requireAuth,
  requireRole("admin", "doctor"),
  asyncHandler(async (_req, res) => {
    const queue = await getPriorityQueue();
    return res.json({ queue });
  })
);

router.post(
  "/ai/predict-demand",
  requireAuth,
  requireRole("admin", "doctor"),
  asyncHandler(async (_req, res) => {
    const prediction = await predictBloodDemand();
    return res.json({ prediction });
  })
);

router.post(
  "/ai/match-donors",
  requireAuth,
  asyncHandler(async (req, res) => {
    const schema = z.object({
      bloodGroup: z.enum(BLOOD_GROUPS),
      lat: z.number(),
      lng: z.number(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid match request" });

    const donors = await Donor.find({
      bloodGroup: parsed.data.bloodGroup,
      isAvailable: true,
    });
    const ranked = rankByDistance(
      { lat: parsed.data.lat, lng: parsed.data.lng },
      donors
    ).slice(0, 10);

    return res.json({
      donors: ranked.map((r) => ({ ...r.item.toObject(), distanceKm: r.distanceKm })),
    });
  })
);

export default router;
