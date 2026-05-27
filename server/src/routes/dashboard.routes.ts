import { Router } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.js";
import { DeliveryOrder } from "../models/Order.js";
import { BloodRequest } from "../models/BloodBank.js";
import { Appointment } from "../models/Appointment.js";
import { SymptomRecord, Prescription } from "../models/Clinical.js";
import { Reminder } from "../models/Clinical.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user!._id;

    const [user, orders, bloodRequests, appointments, symptoms, prescriptions, reminders] =
      await Promise.all([
        User.findById(userId),
        DeliveryOrder.find({ userId }).sort({ createdAt: -1 }).limit(5),
        BloodRequest.find({ userId }).sort({ createdAt: -1 }).limit(3),
        Appointment.find({ userId }).sort({ createdAt: -1 }).limit(5),
        SymptomRecord.find({ userId }).sort({ createdAt: -1 }).limit(5),
        Prescription.find({ userId }).sort({ createdAt: -1 }).limit(5),
        Reminder.find({ userId }).sort({ createdAt: -1 }).limit(5),
      ]);

    return res.json({
      profile: user
        ? {
            name: user.name,
            email: user.email,
            role: user.role,
            bloodType: user.medicalData?.bloodType,
            conditions: user.medicalData?.conditions ?? [],
            allergies: user.medicalData?.allergies ?? [],
          }
        : null,
      stats: {
        orders: orders.length,
        appointments: appointments.length,
        symptomChecks: symptoms.length,
        activeReminders: reminders.filter((r) => r.enabled).length,
      },
      recentOrders: orders,
      recentBloodRequests: bloodRequests,
      upcomingAppointments: appointments.filter((a) => a.status === "scheduled"),
      recentSymptoms: symptoms,
      recentPrescriptions: prescriptions,
      reminders,
    });
  })
);

export default router;
