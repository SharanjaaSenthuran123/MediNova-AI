"use client";

import { useEffect, useState } from "react";

export interface ConfigStatus {
  provider?: string;
  openai: string;
  gemini?: string;
  liveAi: boolean;
  hint: string | null;
}

export function useConfigStatus() {
  const [status, setStatus] = useState<ConfigStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/config/status", { cache: "no-store" });
        const data = (await res.json()) as ConfigStatus;
        if (!cancelled) setStatus(data);
      } catch {
        if (!cancelled) {
          setStatus({
            openai: "missing_key",
            liveAi: false,
            hint:
              "Could not read AI config. Add OPENAI_API_KEY to .env.local and restart npm run dev.",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { status, loading, isDemoMode: status ? !status.liveAi : false };
}
