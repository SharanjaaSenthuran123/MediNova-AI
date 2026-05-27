import { Router } from "express";
import { z } from "zod";
import { User } from "../models/User.js";
import { publicUser, clearAuthCookies } from "../utils/helpers.js";
import { initialsFromName } from "../utils/jwt.js";
import type { AuthRequest } from "../middleware/auth.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";

const router = Router();

function duplicateKeyError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: number }).code === 11000
  );
}

router.get("/", optionalAuth, async (req: AuthRequest, res) => {
  if (!req.user) return res.json({ user: null });
  return res.json({ user: publicUser(req.user) });
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const schema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    age: z.number().optional(),
    gender: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid profile data" });
  }

  const user = req.user!;
  user.name = parsed.data.name;
  user.email = parsed.data.email.toLowerCase();
  user.age = parsed.data.age;
  user.gender = parsed.data.gender;
  user.avatarInitials = initialsFromName(parsed.data.name);

  try {
    await user.save();
  } catch (err) {
    if (duplicateKeyError(err)) {
      return res.status(409).json({ error: "Email already in use" });
    }
    throw err;
  }

  return res.json({ user: publicUser(user) });
});

router.patch("/", requireAuth, async (req: AuthRequest, res) => {
  const schema = z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    age: z.number().optional(),
    gender: z.string().optional(),
    phone: z.string().optional(),
    profileImage: z.string().optional(),
    medicalData: z
      .object({
        bloodType: z.string().optional(),
        allergies: z.array(z.string()).optional(),
        conditions: z.array(z.string()).optional(),
      })
      .optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid profile data" });
  }

  const user = req.user!;
  if (parsed.data.email) {
    parsed.data.email = parsed.data.email.toLowerCase();
  }
  Object.assign(user, parsed.data);
  if (parsed.data.name) {
    user.avatarInitials = initialsFromName(parsed.data.name);
  }

  try {
    await user.save();
  } catch (err) {
    if (duplicateKeyError(err)) {
      return res.status(409).json({ error: "Email already in use" });
    }
    throw err;
  }

  return res.json({ user: publicUser(user) });
});

router.patch("/location", requireAuth, async (req: AuthRequest, res) => {
  const schema = z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid location" });
  }

  req.user!.location = {
    lat: parsed.data.lat,
    lng: parsed.data.lng,
    address: parsed.data.address,
    updatedAt: new Date(),
  };
  await req.user!.save();

  return res.json({
    location: {
      lat: parsed.data.lat,
      lng: parsed.data.lng,
      address: parsed.data.address,
      updatedAt: req.user!.location.updatedAt?.toISOString(),
    },
  });
});

router.delete("/", requireAuth, async (_req: AuthRequest, res) => {
  clearAuthCookies(res);
  return res.json({ success: true });
});

router.get("/contacts", requireAuth, async (req: AuthRequest, res) => {
  return res.json({ contacts: req.user!.emergencyContacts ?? [] });
});

router.put("/contacts", requireAuth, async (req: AuthRequest, res) => {
  const contacts = req.body.contacts;
  if (!Array.isArray(contacts)) {
    return res.status(400).json({ error: "Invalid contacts" });
  }
  req.user!.emergencyContacts = contacts;
  await req.user!.save();
  return res.json({ contacts: req.user!.emergencyContacts });
});

export default router;
