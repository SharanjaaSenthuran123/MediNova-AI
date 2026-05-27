"use client";

import { useEffect } from "react";
import { io, type Socket } from "socket.io-client";
import { toast } from "sonner";

let socket: Socket | null = null;

export function getSocket() {
  if (typeof window === "undefined") return null;
  if (!socket) {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000";
    socket = io(url, { withCredentials: true, autoConnect: false });
  }
  return socket;
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then((r) => r.json())
      .then((data: { user?: { id: string } | null }) => {
        if (!data.user?.id) return;
        const s = getSocket();
        if (!s) return;
        s.connect();
        s.emit("join", data.user.id);
        s.on("notification", (payload: { title: string; body: string; urgent?: boolean }) => {
          if (payload.urgent) {
            toast.error(payload.title, { description: payload.body });
          } else {
            toast.info(payload.title, { description: payload.body });
          }
        });
        s.on("emergency:alert", (payload: { message: string }) => {
          toast.error("Emergency alert", { description: payload.message });
        });
        s.on("pharmacy:stock", (payload: { medicineName: string; stock: number }) => {
          toast.info("Pharmacy stock update", {
            description: `${payload.medicineName}: ${payload.stock} units`,
          });
        });
        s.on("bloodbank:emergency", (payload: { message: string; bloodGroup: string }) => {
          toast.error("Blood emergency", {
            description: `${payload.bloodGroup} — ${payload.message}`,
          });
        });
      })
      .catch(() => undefined);

    return () => {
      socket?.disconnect();
    };
  }, []);

  return <>{children}</>;
}
