import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB, isMongoConfigured } from "@/lib/mongodb";
import { isRemoteApiConfigured } from "@/lib/api/fetch-api";
import {
  User,
  initialsFromName,
  publicUser,
  type UserRole,
} from "@/lib/models/User";
import { signToken, verifyToken } from "@/lib/auth/jwt";

const USER_ROLES = ["patient", "doctor", "pharmacy", "donor", "admin"] as const;

export function useDirectAuth(): boolean {
  return !isRemoteApiConfigured() && isMongoConfigured();
}

export function vercelSetupError(): string {
  return (
    "Production is missing environment variables. In Vercel → Settings → Environment Variables, set " +
    "MONGODB_URI, JWT_SECRET, and CLIENT_URL (https://medi-nova-ai-2fqi.vercel.app). " +
    "For pharmacy, orders, and real-time features, also deploy the Express API and set API_URL."
  );
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(USER_ROLES).optional(),
  remember: z.boolean().optional(),
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(USER_ROLES).default("patient"),
  phone: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export async function directLogin(body: unknown) {
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false as const, status: 400, error: "Invalid credentials" };
  }

  await connectDB();
  const user = await User.findOne({ email: parsed.data.email.toLowerCase() });
  if (!user || !(await bcrypt.compare(parsed.data.password, user.password))) {
    return { ok: false as const, status: 401, error: "Invalid email or password" };
  }

  if (parsed.data.role && user.role !== parsed.data.role) {
    return {
      ok: false as const,
      status: 403,
      error: `This account is registered as ${user.role}`,
    };
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

  return {
    ok: true as const,
    user: publicUser(user),
    token,
    remember: parsed.data.remember,
  };
}

export async function directRegister(body: unknown) {
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false as const, status: 400, error: "Invalid registration data" };
  }

  await connectDB();
  const email = parsed.data.email.toLowerCase();
  const exists = await User.findOne({ email });
  if (exists) {
    return { ok: false as const, status: 400, error: "Email already registered" };
  }

  const hashed = await bcrypt.hash(parsed.data.password, 12);
  const user = await User.create({
    name: parsed.data.name,
    email,
    password: hashed,
    role: parsed.data.role as UserRole,
    phone: parsed.data.phone,
    avatarInitials: initialsFromName(parsed.data.name),
    ...(parsed.data.lat != null &&
      parsed.data.lng != null && {
        location: {
          lat: parsed.data.lat,
          lng: parsed.data.lng,
          updatedAt: new Date(),
        },
      }),
  });

  const token = signToken({
    sub: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return { ok: true as const, user: publicUser(user), token };
}

export async function directSession(token: string) {
  const payload = verifyToken(token);
  if (!payload) {
    return { ok: false as const, status: 401, error: "Invalid or expired token" };
  }

  await connectDB();
  const user = await User.findById(payload.sub);
  if (!user) {
    return { ok: false as const, status: 401, error: "Invalid or expired token" };
  }

  return { ok: true as const, user: publicUser(user), token };
}

export async function checkMongoHealth() {
  if (!isMongoConfigured()) {
    return { ok: false as const, error: "MONGODB_URI is not configured" };
  }
  await connectDB();
  return { ok: true as const };
}
