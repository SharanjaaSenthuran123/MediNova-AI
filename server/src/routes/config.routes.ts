import { Router } from "express";
import { env } from "../config/env.js";
import { isEmailConfigured } from "../services/email.service.js";
import { isSmsConfigured } from "../services/sms.service.js";

const router = Router();

router.get("/status", (_req, res) => {
  return res.json({
    ok: true,
    database: "mongodb",
    openai: Boolean(env.openaiKey),
    email: isEmailConfigured(),
    sms: isSmsConfigured(),
    realtime: true,
  });
});

export default router;
