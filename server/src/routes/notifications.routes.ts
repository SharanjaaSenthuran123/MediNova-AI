import { Router } from "express";
import { isDemoMode } from "../config/database.js";
import type { AuthRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";
import { Notification } from "../models/Clinical.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    if (isDemoMode() || !req.user) {
      return res.json({ notifications: [] });
    }

    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);
    return res.json({
      notifications: notifications.map((n) => ({
        id: n._id.toString(),
        title: n.title,
        body: n.body,
        type: n.type,
        read: n.read,
        urgent: n.urgent,
        createdAt: n.createdAt.toISOString(),
      })),
    });
  })
);

router.patch(
  "/:id/read",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    if (isDemoMode() || !req.user) {
      return res.json({ success: true });
    }

    await Notification.updateOne(
      { _id: req.params.id, userId: req.user._id },
      { read: true }
    );
    return res.json({ success: true });
  })
);

export default router;
