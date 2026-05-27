import { Router } from "express";
import { z } from "zod";
import { Appointment } from "../models/Appointment.js";
import { Notification } from "../models/Clinical.js";
import { DEFAULT_PREP, toAppointmentDto } from "../utils/helpers.js";
import type { AuthRequest } from "../middleware/auth.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { sendAppointmentEmail } from "../services/email.service.js";
import { emitToUser } from "../services/socket.service.js";

const router = Router();

router.get("/", optionalAuth, async (req: AuthRequest, res) => {
  if (!req.user) return res.json({ appointments: [] });
  const appointments = await Appointment.find({ userId: req.user._id }).sort({
    createdAt: -1,
  });
  return res.json({ appointments: appointments.map(toAppointmentDto) });
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const schema = z.object({
    providerName: z.string(),
    specialty: z.string(),
    date: z.string(),
    time: z.string(),
    type: z.enum(["virtual", "in-person"]),
    notes: z.string().optional(),
    doctorId: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid appointment data" });
  }

  const appt = await Appointment.create({
    userId: req.user!._id,
    doctorId: parsed.data.doctorId,
    ...parsed.data,
    status: "scheduled",
    prepChecklist: DEFAULT_PREP,
  });

  await sendAppointmentEmail(req.user!.email, {
    provider: parsed.data.providerName,
    date: parsed.data.date,
    time: parsed.data.time,
  });

  await Notification.create({
    userId: req.user!._id,
    title: "Appointment confirmed",
    body: `${parsed.data.providerName} on ${parsed.data.date} at ${parsed.data.time}`,
    type: "appointment",
  });

  emitToUser(req.user!._id.toString(), "notification", {
    title: "Appointment confirmed",
    body: `${parsed.data.providerName} on ${parsed.data.date}`,
  });

  return res.json({ appointment: toAppointmentDto(appt) });
});

router.patch("/", requireAuth, async (req: AuthRequest, res) => {
  const schema = z.object({
    id: z.string(),
    status: z.enum(["scheduled", "completed", "cancelled"]).optional(),
    date: z.string().optional(),
    time: z.string().optional(),
    notes: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid update" });
  }

  const appt = await Appointment.findOne({
    _id: parsed.data.id,
    userId: req.user!._id,
  });
  if (!appt) return res.status(404).json({ error: "Appointment not found" });

  if (parsed.data.status) appt.status = parsed.data.status;
  if (parsed.data.date) appt.date = parsed.data.date;
  if (parsed.data.time) appt.time = parsed.data.time;
  if (parsed.data.notes !== undefined) appt.notes = parsed.data.notes;
  await appt.save();

  emitToUser(req.user!._id.toString(), "appointment:update", {
    appointment: toAppointmentDto(appt),
  });

  return res.json({ appointment: toAppointmentDto(appt) });
});

export default router;
