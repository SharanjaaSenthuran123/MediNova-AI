import { Router } from "express";
import { Doctor } from "../models/Doctor.js";
import type { AuthRequest } from "../middleware/auth.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

function toDto(d: InstanceType<typeof Doctor>) {
  return {
    id: d._id.toString(),
    name: d.name,
    email: d.email,
    specialty: d.specialty,
    hospital: d.hospital,
    rating: d.rating,
    reviews: d.reviews,
    experience: d.experience,
    availability: d.availability,
    nextSlot: d.schedule[0]?.slots[0] ?? "Contact for availability",
    avatarInitials: d.avatarInitials,
    patients: d.patients,
    schedule: d.schedule,
    bio: d.bio,
  };
}

router.get("/", requireAuth, async (_req, res) => {
  const doctors = await Doctor.find().sort({ rating: -1 });
  return res.json({ doctors: doctors.map(toDto) });
});

router.get("/:id", requireAuth, async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) return res.status(404).json({ error: "Doctor not found" });
  return res.json({ doctor: toDto(doctor) });
});

router.patch(
  "/:id/availability",
  requireAuth,
  requireRole("doctor", "admin"),
  async (req: AuthRequest, res) => {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    if (req.body.availability) {
      doctor.availability = req.body.availability;
    }
    if (req.body.schedule) {
      doctor.schedule = req.body.schedule;
    }
    await doctor.save();
    return res.json({ doctor: toDto(doctor) });
  }
);

export default router;
