"use client";

import { DemoModeBanner } from "@/components/ui/DemoModeBanner";
import { useConfigStatus } from "@/hooks/useConfigStatus";

/** Client-only banner — avoids SSR/env drift and matches runtime API key state. */
export function DemoModeNotice() {
  const { status } = useConfigStatus();

  if (!status || status.liveAi) return null;

  return (
    <DemoModeBanner
      message={
        status.hint ??
        "Add OPENAI_API_KEY to .env.local for live AI (Symptom Checker & Smart Medicine Scanner safety insights), then restart npm run dev."
      }
    />
  );
}
