import { Router } from "express";
import { z } from "zod";
import { Patient } from "../models/Patient.js";
import type { AuthRequest } from "../middleware/auth.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

function toDto(p: InstanceType<typeof Patient>) {
  return {
    id: p._id.toString(),
    name: p.name,
    email: p.email,
    age: p.age,
    gender: p.gender,
    condition: p.condition,
    status: p.status,
    healthScore: p.healthScore,
    doctor: p.doctorName,
    doctorId: p.doctorId?.toString(),
    avatarInitials: p.avatarInitials,
    lastVisit: p.lastVisit || p.updatedAt.toISOString().slice(0, 10),
    medicalHistory: p.medicalHistory,
  };
}

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const filter =
    req.user!.role === "admin" || req.user!.role === "doctor"
      ? {}
      : { $or: [{ userId: req.user!._id }, { managedBy: req.user!._id }] };

  const patients = await Patient.find(filter).sort({ updatedAt: -1 }).limit(100);
  return res.json({ patients: patients.map(toDto) });
});

router.post(
  "/",
  requireAuth,
  requireRole("doctor", "admin"),
  async (req: AuthRequest, res) => {
    const schema = z.object({
      name: z.string().min(1),
      email: z.string().email().optional().or(z.literal("")),
      age: z.coerce.number().int().min(0).max(150),
      gender: z.string().min(1),
      condition: z.string().min(1),
      status: z.enum(["stable", "monitoring", "critical"]).optional(),
      healthScore: z.coerce.number().min(0).max(100).optional(),
      doctorName: z.string().optional(),
      doctorId: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid patient data",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const payload = {
      ...parsed.data,
      email: parsed.data.email || undefined,
    };

    const initials = parsed.data.name
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const patient = await Patient.create({
      ...payload,
      managedBy: req.user!._id,
      avatarInitials: initials,
      lastVisit: new Date().toISOString().slice(0, 10),
    });

    return res.status(201).json({ patient: toDto(patient) });
  }
);

router.patch(
  "/:id",
  requireAuth,
  requireRole("doctor", "admin"),
  async (req: AuthRequest, res) => {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    Object.assign(patient, req.body);
    patient.lastVisit = new Date().toISOString().slice(0, 10);
    await patient.save();
    return res.json({ patient: toDto(patient) });
  }
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  async (req: AuthRequest, res) => {
    await Patient.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  }
);

router.post(
  "/:id/history",
  requireAuth,
  requireRole("doctor", "admin"),
  async (req: AuthRequest, res) => {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    patient.medicalHistory.unshift({
      date: new Date().toISOString().slice(0, 10),
      note: String(req.body.note ?? ""),
      type: String(req.body.type ?? "note"),
    });
    await patient.save();
    return res.json({ patient: toDto(patient) });
  }
);

export default router;
