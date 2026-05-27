import { Router } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { buildUserReports } from "../services/reports.service.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const data = await buildUserReports(req.user!._id.toString());
    return res.json(data);
  })
);

export default router;
