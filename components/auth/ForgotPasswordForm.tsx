"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { Input } from "@/components/ui/Input";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [demoCode, setDemoCode] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Request failed");
        return;
      }
      if (data.demoCode) setDemoCode(data.demoCode);
      router.push(
        `/verify-otp?email=${encodeURIComponent(email)}&code=${encodeURIComponent(data.demoCode ?? "")}`
      );
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm text-muted">
        Enter your email and we&apos;ll send a verification code to reset your
        password.
      </p>

      <Input
        label="Email address"
        type="email"
        placeholder="you@hospital.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      {error && <FormError message={error} />}
      {demoCode && (
        <p className="rounded-xl bg-primary/5 p-3 text-xs text-muted">
          Demo OTP: <strong className="text-primary">{demoCode}</strong>
        </p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending code...
          </>
        ) : (
          <>
            <Mail className="h-4 w-4" />
            Send reset code
          </>
        )}
      </Button>

      <p className="text-center text-sm text-muted">
        <Link href="/" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
