"use client";

import { useEffect } from "react";

interface HomeSectionRedirectProps {
  section: string;
}

/** Sends users to a homepage anchor (e.g. /#features). */
export function HomeSectionRedirect({ section }: HomeSectionRedirectProps) {
  useEffect(() => {
    window.location.replace(`/#${section}`);
  }, [section]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <p className="text-sm text-muted">Taking you to the homepage…</p>
    </main>
  );
}
