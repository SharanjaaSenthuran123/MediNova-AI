import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { verifyToken } from "../utils/jwt.js";
import { User, type IUser } from "../models/User.js";

export interface AuthRequest extends Request {
  user?: IUser;
  userId?: string;
}

function isMongoObjectId(value: string): boolean {
  return (
    mongoose.isValidObjectId(value) &&
    String(new mongoose.Types.ObjectId(value)) === value
  );
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const token =
      req.cookies?.medinova_token ??
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    if (!isMongoObjectId(payload.sub)) {
      return res.status(401).json({ error: "Invalid session — please sign in again" });
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch (err) {
    next(err);
  }
}

export function optionalAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const token =
    req.cookies?.medinova_token ??
    req.headers.authorization?.replace("Bearer ", "");
  if (!token) return next();

  const payload = verifyToken(token);
  if (!payload || !isMongoObjectId(payload.sub)) return next();

  User.findById(payload.sub)
    .then((user) => {
      if (user) {
        req.user = user;
        req.userId = user._id.toString();
      }
      next();
    })
    .catch(next);
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role || !roles.includes(role)) {
      const hint =
        roles.includes("doctor") && roles.includes("admin")
          ? "Only doctors and admins can perform this action."
          : "Insufficient permissions";
      return res.status(403).json({ error: hint });
    }
    next();
  };
}
