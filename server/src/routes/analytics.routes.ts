import { Router } from "express";
import { isDemoMode } from "../config/database.js";
import { Patient } from "../models/Patient.js";
import { Appointment } from "../models/Appointment.js";
import { SymptomRecord } from "../models/Clinical.js";
import type { AuthRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

const demoAnalytics = {
  stats: {
    patients: 1,
    appointments: 0,
    aiChecks: 0,
    avgHealthScore: 82,
  },
  diseaseTrends: [{ name: "General", count: 1 }],
  recovery: [
    { week: "Week 1", value: 45 },
    { week: "Week 2", value: 58 },
    { week: "Week 3", value: 72 },
    { week: "Week 4", value: 85 },
  ],
  heartRate: [74, 71, 73, 70, 72, 68, 72],
  adherence: [88, 91, 94, 94],
};

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    if (isDemoMode() || !req.user) {
      return res.json(demoAnalytics);
    }

    const userId = req.user._id;
    const role = req.user.role;

    const [patientCount, appointmentCount, symptomCount, patients] =
      await Promise.all([
        Patient.countDocuments(role === "patient" ? { userId } : {}),
        Appointment.countDocuments({ userId }),
        SymptomRecord.countDocuments({ userId }),
        Patient.find(role === "patient" ? { userId } : {}).limit(50),
      ]);

    const avgHealthScore =
      patients.length > 0
        ? Math.round(
            patients.reduce((a, p) => a + p.healthScore, 0) / patients.length
          )
        : req.user.medicalData
          ? 82
          : 0;

    const diseaseCounts: Record<string, number> = {};
    for (const p of patients) {
      const key = p.condition.split(" ")[0] ?? "Other";
      diseaseCounts[key] = (diseaseCounts[key] ?? 0) + 1;
    }

    return res.json({
      stats: {
        patients: patientCount,
        appointments: appointmentCount,
        aiChecks: symptomCount,
        avgHealthScore,
      },
      diseaseTrends: Object.entries(diseaseCounts).map(([name, count]) => ({
        name,
        count,
      })),
      recovery: demoAnalytics.recovery,
      heartRate: demoAnalytics.heartRate,
      adherence: demoAnalytics.adherence,
    });
  })
);

export default router;
