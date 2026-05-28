"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { RoleSelector } from "@/components/auth/RoleSelector";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { FormError } from "@/components/ui/FormError";
import { Input } from "@/components/ui/Input";
import { API_OFFLINE_MESSAGE, API_OFFLINE_TOAST } from "@/lib/api/errors";
import type { UserRole } from "@/types/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/home";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("patient");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, role, remember }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed");
        toast.error(data.error ?? "Login failed");
        return;
      }
      toast.success(`Welcome back, ${data.user?.name ?? "User"}!`);
      router.push(redirect);
      router.refresh();
    } catch {
      setError(API_OFFLINE_MESSAGE);
      toast.error(API_OFFLINE_TOAST);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <RoleSelector value={role} onChange={setRole} />

      <Input
        label="Email address"
        type="email"
        placeholder="you@hospital.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />

      <Input
        label="Password"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
      />

      <div className="flex items-center justify-between gap-4">
        <Checkbox
          label="Remember me"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
        />
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-primary hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      {error && <FormError message={error} />}

      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
        <Button
          type="submit"
          className="w-full shadow-glow-lg"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              Sign in securely
            </>
          )}
        </Button>
      </motion.div>

      <SocialLoginButtons disabled={loading} />

      <p className="text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create account
        </Link>
      </p>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted">
        <p className="mb-1 font-medium text-foreground">Demo accounts</p>
        <p>
          <Mail className="mr-1 inline h-3 w-3" />
          patient@medinova.ai · doctor@medinova.ai · admin@medinova.ai
        </p>
        <p className="mt-1">Password: demo123</p>
        <p className="mt-2 border-t border-primary/10 pt-2">
          New account?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Create account
          </Link>{" "}
          (requires MongoDB — local: npm run dev, production: Vercel env vars).
        </p>
      </div>
    </form>
  );
}
