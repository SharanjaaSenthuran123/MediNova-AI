"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

type ApiStatus = "checking" | "online" | "offline";

const MAX_RETRIES = 40;
const RETRY_MS = 2000;

export function ApiOfflineNotice() {
  const [status, setStatus] = useState<ApiStatus>("checking");
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let attempt = 0;

    async function check(): Promise<boolean> {
      try {
        const res = await fetch("/api/health", { cache: "no-store" });
        const data = (await res.json()) as {
          ok?: boolean;
          mode?: string;
          hint?: string;
          error?: string;
        };
        if (!cancelled) {
          if (res.ok && data.ok) {
            setStatus("online");
            setHint(
              data.mode === "vercel-auth"
                ? "Auth via MongoDB — set API_URL on Vercel for full backend features."
                : null
            );
            return true;
          }
          setHint(data.error ?? data.hint ?? null);
        }
      } catch {
        if (!cancelled) setHint(null);
      }
      return false;
    }

    async function poll() {
      while (!cancelled && attempt < MAX_RETRIES) {
        attempt += 1;
        if (await check()) return;
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, RETRY_MS));
        }
      }
      if (!cancelled) setStatus("offline");
    }

    void poll();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "online") return null;

  if (status === "checking") {
    return (
      <div
        role="status"
        className="mb-6 flex items-center gap-2 rounded-xl border border-border/60 bg-card/50 px-4 py-3 text-sm text-muted"
      >
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        Connecting to backend…
      </div>
    );
  }

  const isProduction =
    typeof window !== "undefined" &&
    !window.location.hostname.includes("localhost");

  return (
    <div
      role="alert"
      className="mb-6 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-foreground"
    >
      <p className="flex items-start gap-2 font-medium">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        {isProduction ? "Backend not configured" : "API server is not running"}
      </p>
      {isProduction ? (
        <p className="mt-2 text-muted">
          In Vercel → Settings → Environment Variables, set{" "}
          <strong className="text-foreground">MONGODB_URI</strong>,{" "}
          <strong className="text-foreground">JWT_SECRET</strong>, and{" "}
          <strong className="text-foreground">CLIENT_URL</strong>. For pharmacy
          and real-time features, deploy the Express API and set{" "}
          <strong className="text-foreground">API_URL</strong>.
        </p>
      ) : (
        <>
          <p className="mt-2 text-muted">
            Login needs the Express API on port{" "}
            <strong className="text-foreground">4000</strong>. From the project
            root run:
          </p>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-background/60 px-3 py-2 text-xs">
            npm run dev
          </pre>
          <p className="mt-2 text-xs text-muted">
            Demo login after seed:{" "}
            <code className="text-foreground">patient@medinova.ai</code> /{" "}
            <code className="text-foreground">demo123</code>
          </p>
        </>
      )}
      {hint ? <p className="mt-2 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
