import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { User } from "../models/User.js";
import { OtpToken } from "../models/Clinical.js";
import { Notification } from "../models/Clinical.js";
import {
  clearAuthCookies,
  publicUser,
  setAuthCookies,
} from "../utils/helpers.js";
import { initialsFromName, signToken } from "../utils/jwt.js";
import type { AuthRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";
import {
  sendOtpEmail,
  sendWelcomeEmail,
} from "../services/email.service.js";
import { emitToUser } from "../services/socket.service.js";

const router = Router();

const USER_ROLES = ["patient", "doctor", "pharmacy", "donor", "admin"] as const;

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post("/login", async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
    role: z.enum(USER_ROLES).optional(),
    remember: z.boolean().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const user = await User.findOne({ email: parsed.data.email.toLowerCase() });
  if (!user || !(await bcrypt.compare(parsed.data.password, user.password))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  if (parsed.data.role && user.role !== parsed.data.role) {
    return res
      .status(403)
      .json({ error: `This account is registered as ${user.role}` });
  }

  const token = signToken(
    {
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    },
    parsed.data.remember ? "30d" : "7d"
  );

  setAuthCookies(res, {
    userId: user._id.toString(),
    token,
    role: user.role,
    remember: parsed.data.remember,
  });

  return res.json({ user: publicUser(user), token });
});

router.post("/register", async (req, res) => {
  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(USER_ROLES).default("patient"),
    phone: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid registration data" });
  }

  const exists = await User.findOne({ email: parsed.data.email.toLowerCase() });
  if (exists) {
    return res.status(400).json({ error: "Email already registered" });
  }

  const hashed = await bcrypt.hash(parsed.data.password, 12);
  const user = await User.create({
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    password: hashed,
    role: parsed.data.role,
    phone: parsed.data.phone,
    avatarInitials: initialsFromName(parsed.data.name),
    ...(parsed.data.lat != null &&
      parsed.data.lng != null && {
        location: { lat: parsed.data.lat, lng: parsed.data.lng, updatedAt: new Date() },
      }),
  });

  const code = generateOtp();
  await OtpToken.create({
    email: user.email,
    code,
    purpose: "verify",
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });
  await sendOtpEmail(user.email, code, "verify");
  await sendWelcomeEmail(user.email, user.name);

  const token = signToken({
    sub: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  });

  setAuthCookies(res, {
    userId: user._id.toString(),
    token,
    role: user.role,
  });

  return res.json({ user: publicUser(user), token });
});

router.get("/session", requireAuth, async (req: AuthRequest, res) => {
  return res.json({
    user: publicUser(req.user!),
    token: req.cookies?.medinova_token,
  });
});

router.delete("/session", (_req, res) => {
  clearAuthCookies(res);
  return res.json({ success: true });
});

router.post("/forgot-password", async (req, res) => {
  const email = String(req.body.email ?? "")
    .trim()
    .toLowerCase();
  if (!email) return res.status(400).json({ error: "Email is required" });

  const user = await User.findOne({ email });
  if (user) {
    const code = generateOtp();
    await OtpToken.deleteMany({ email, purpose: "reset" });
    await OtpToken.create({
      email,
      code,
      purpose: "reset",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    await sendOtpEmail(email, code, "reset");
    if (process.env.NODE_ENV !== "production") {
      return res.json({
        success: true,
        message: "Reset code sent.",
        demoCode: code,
      });
    }
  }

  return res.json({
    success: true,
    message: "If an account exists, a reset code has been sent.",
  });
});

router.post("/verify-otp", async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    code: z.string().min(6).max(6),
    purpose: z.enum(["verify", "reset"]).default("reset"),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid verification data" });
  }

  const otp = await OtpToken.findOne({
    email: parsed.data.email.toLowerCase(),
    code: parsed.data.code,
    purpose: parsed.data.purpose,
    expiresAt: { $gt: new Date() },
  });

  if (!otp) {
    return res.status(400).json({ error: "Invalid or expired code" });
  }

  if (parsed.data.purpose === "verify") {
    await User.updateOne(
      { email: parsed.data.email.toLowerCase() },
      { isEmailVerified: true }
    );
    await OtpToken.deleteOne({ _id: otp._id });
  }

  return res.json({ success: true, verified: true });
});

router.post("/reset-password", async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    code: z.string().min(6).max(6),
    password: z.string().min(6),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid reset data" });
  }

  const otp = await OtpToken.findOne({
    email: parsed.data.email.toLowerCase(),
    code: parsed.data.code,
    purpose: "reset",
    expiresAt: { $gt: new Date() },
  });

  if (!otp) {
    return res.status(400).json({ error: "Invalid or expired verification code" });
  }

  const hashed = await bcrypt.hash(parsed.data.password, 12);
  await User.updateOne(
    { email: parsed.data.email.toLowerCase() },
    { password: hashed }
  );
  await OtpToken.deleteOne({ _id: otp._id });

  return res.json({ success: true });
});

export default router;
