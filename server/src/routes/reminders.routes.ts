import { Router } from "express";
import { z } from "zod";
import { Reminder, Prescription, MedicineScan } from "../models/Clinical.js";
import type { AuthRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

const SCHEDULE_TIMES: Record<string, string> = {
  morning: "08:00",
  afternoon: "13:00",
  evening: "18:00",
  bedtime: "21:30",
};

function scheduleToTime(
  schedule: string,
  customTime?: string
): string {
  if (schedule === "custom" && customTime) return customTime;
  return SCHEDULE_TIMES[schedule] ?? "08:00";
}

function toDto(r: InstanceType<typeof Reminder>) {
  return {
    id: r._id.toString(),
    userId: r.userId.toString(),
    medicineName: r.medicineName,
    dosage: r.dosage,
    schedule: r.schedule ?? "morning",
    customTime: r.customTime,
    time: r.time,
    frequency: r.frequency,
    enabled: r.enabled,
    channel: r.channel ?? "push",
    source: r.source ?? "manual",
    takenToday: r.takenToday,
    createdAt: (r as { createdAt?: Date }).createdAt?.toISOString() ?? new Date().toISOString(),
    lastNotifiedAt: r.lastNotifiedAt?.toISOString(),
  };
}

async function buildSuggestions(userId: string) {
  const [prescriptions, scans, reminders] = await Promise.all([
    Prescription.find({ userId }).sort({ createdAt: -1 }).limit(5),
    MedicineScan.find({ userId, found: true }).sort({ createdAt: -1 }).limit(5),
    Reminder.find({ userId }).select("medicineName"),
  ]);

  const existing = new Set(reminders.map((r) => r.medicineName.toLowerCase()));
  const suggestions: { medicineName: string; source: string; label: string }[] = [];

  for (const rx of prescriptions) {
    for (const name of rx.medicines) {
      const key = name.toLowerCase();
      if (!name.trim() || existing.has(key)) continue;
      suggestions.push({
        medicineName: name,
        source: "prescription",
        label: `From prescription (${new Date((rx as { createdAt?: Date }).createdAt ?? Date.now()).toLocaleDateString()})`,
      });
      existing.add(key);
    }
  }

  for (const scan of scans) {
    const key = scan.medicineName.toLowerCase();
    if (!scan.medicineName.trim() || existing.has(key)) continue;
    suggestions.push({
      medicineName: scan.medicineName,
      source: "barcode",
      label: `From barcode scan (${scan.barcode})`,
    });
    existing.add(key);
  }

  return suggestions.slice(0, 8);
}

const createSchema = z.object({
  medicineName: z.string().trim().min(1).max(120).optional(),
  dosage: z.string().trim().max(80).optional(),
  schedule: z.enum(["morning", "afternoon", "evening", "bedtime", "custom"]).default("morning"),
  customTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  channel: z.enum(["push", "email", "both"]).default("push"),
  source: z.enum(["manual", "prescription", "barcode"]).default("manual"),
  enabled: z.boolean().default(true),
  fromSuggestion: z
    .object({
      medicineName: z.string().trim().min(1),
      source: z.enum(["prescription", "barcode"]).optional(),
    })
    .optional(),
});

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const [reminders, suggestions] = await Promise.all([
      Reminder.find({ userId: req.user!._id }).sort({ time: 1 }),
      buildSuggestions(req.user!._id.toString()),
    ]);
    return res.json({
      reminders: reminders.map(toDto),
      suggestions,
    });
  })
);

router.post(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid reminder data", details: parsed.error.flatten() });
    }

    const data = parsed.data;
    const medicineName =
      data.medicineName?.trim() ?? data.fromSuggestion?.medicineName?.trim();
    if (!medicineName) {
      return res.status(400).json({ error: "Medicine name is required" });
    }

    const schedule = data.schedule;
    const source =
      data.fromSuggestion?.source ?? data.source;

    const reminder = await Reminder.create({
      userId: req.user!._id,
      medicineName,
      dosage: data.dosage,
      schedule,
      customTime: data.customTime,
      time: scheduleToTime(schedule, data.customTime),
      frequency: "daily",
      channel: data.channel,
      source,
      enabled: data.enabled,
    });

    return res.status(201).json({ reminder: toDto(reminder) });
  })
);

router.patch(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const id = String(req.body.id ?? "");
    if (!id) return res.status(400).json({ error: "Reminder id required" });

    const reminder = await Reminder.findOne({ _id: id, userId: req.user!._id });
    if (!reminder) return res.status(404).json({ error: "Reminder not found" });

    if (typeof req.body.enabled === "boolean") reminder.enabled = req.body.enabled;
    if (req.body.lastNotifiedAt) {
      reminder.lastNotifiedAt = new Date(req.body.lastNotifiedAt);
    }
    if (req.body.takenToday === true) reminder.takenToday = true;
    if (req.body.medicineName) reminder.medicineName = String(req.body.medicineName);
    if (req.body.dosage !== undefined) reminder.dosage = req.body.dosage;
    if (req.body.schedule) {
      reminder.schedule = req.body.schedule;
      reminder.time = scheduleToTime(req.body.schedule, req.body.customTime ?? reminder.customTime);
    }
    if (req.body.channel) reminder.channel = req.body.channel;

    await reminder.save();
    return res.json({ reminder: toDto(reminder) });
  })
);

router.delete(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const id = String(req.query.id ?? req.body?.id ?? "");
    if (!id) return res.status(400).json({ error: "Reminder id required" });

    const result = await Reminder.deleteOne({ _id: id, userId: req.user!._id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Reminder not found" });
    }
    return res.json({ success: true });
  })
);

export default router;
