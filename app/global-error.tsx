"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

/**
 * Root-level error boundary — must define its own html/body (replaces root layout).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          background: "#f8fafc",
          color: "#0f172a",
        }}
      >
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.5rem" }}>
            MediNova-AI encountered an error
          </p>
          <p style={{ fontSize: "0.875rem", color: "#64748b", maxWidth: "24rem" }}>
            Restart the page. If this keeps happening, stop the dev server, delete
            the <code>.next</code> folder, and run <code>npm run dev:clean</code>.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: "1.5rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.625rem 1.25rem",
              borderRadius: "0.75rem",
              border: "none",
              background: "#14b8a6",
              color: "#fff",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <RefreshCw size={16} />
            Try again
          </button>
          <AlertTriangle
            size={48}
            style={{ marginTop: "1.5rem", color: "#ef4444", opacity: 0.2 }}
            aria-hidden
          />
        </main>
      </body>
    </html>
  );
}
