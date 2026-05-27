import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "../config/env.js";
import { verifyToken } from "../utils/jwt.js";

function parseCookies(header: string): Record<string, string> {
  return Object.fromEntries(
    header.split(";").map((part) => {
      const eq = part.indexOf("=");
      if (eq <= 0) return ["", ""];
      const key = part.slice(0, eq).trim();
      const value = decodeURIComponent(part.slice(eq + 1).trim());
      return [key, value];
    }).filter(([key]) => key)
  );
}

let io: Server | null = null;

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: { origin: env.clientUrl, credentials: true },
  });

  io.on("connection", (socket) => {
    socket.on("join", (userId: string) => {
      if (!userId || typeof userId !== "string") return;

      const rawCookie = socket.handshake.headers.cookie;
      if (!rawCookie) return;

      const parsed = parseCookies(rawCookie);
      const token = parsed.medinova_token;
      if (!token) return;

      const payload = verifyToken(token);
      if (!payload || payload.sub !== userId) return;

      socket.join(`user:${userId}`);
    });
  });

  return io;
}

export function getIO() {
  return io;
}

export function emitToUser(
  userId: string,
  event: string,
  data: Record<string, unknown>
) {
  io?.to(`user:${userId}`).emit(event, data);
}

export function emitBroadcast(event: string, data: Record<string, unknown>) {
  io?.emit(event, data);
}
