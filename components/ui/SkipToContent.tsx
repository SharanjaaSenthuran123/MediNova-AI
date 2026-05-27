"use client";

import { useEffect, useState } from "react";

/** Renders after mount to avoid hydration noise from browser automation tools. */
export function SkipToContent() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <a href="#main-content" className="skip-to-content">
      Skip to main content
    </a>
  );
}
