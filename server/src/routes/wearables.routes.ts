import { Router } from "express";
import { isDemoMode } from "../config/database.js";
import type { AuthRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

const demoMetrics = {
  steps: 8432,
  heartRate: 72,
  sleepHours: 7.2,
  calories: 420,
};

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    if (isDemoMode() || !req.user) {
      return res.json({
        sync: { connected: false },
        metrics: demoMetrics,
      });
    }

    const sync = req.user.wearableSync ?? { connected: false };
    return res.json({
      sync,
      metrics: sync.metrics ?? demoMetrics,
    });
  })
);

router.post(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    if (isDemoMode() || !req.user) {
      return res.json({
        sync: {
          connected: true,
          provider: req.body.provider ?? "Apple Health",
          lastSync: new Date().toISOString(),
          metrics: demoMetrics,
        },
      });
    }

    req.user.wearableSync = {
      connected: true,
      provider: req.body.provider ?? "Apple Health",
      lastSync: new Date().toISOString(),
      metrics: {
        steps: 8432 + Math.floor(Math.random() * 500),
        heartRate: 68 + Math.floor(Math.random() * 10),
        sleepHours: 6.5 + Math.random() * 2,
        calories: 380 + Math.floor(Math.random() * 100),
      },
    };
    await req.user.save();
    return res.json({ sync: req.user.wearableSync });
  })
);

router.delete(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    if (isDemoMode() || !req.user) {
      return res.json({ sync: { connected: false } });
    }

    req.user.wearableSync = { connected: false };
    await req.user.save();
    return res.json({ sync: req.user.wearableSync });
  })
);

export default router;
