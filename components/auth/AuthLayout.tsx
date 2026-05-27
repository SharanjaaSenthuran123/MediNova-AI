"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { ApiOfflineNotice } from "@/components/auth/ApiOfflineNotice";
import { AuthIllustration } from "@/components/auth/AuthIllustration";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { APP_NAME } from "@/lib/constants";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <AuthIllustration />

      <div className="relative flex flex-1 flex-col">
        <header className="flex items-center justify-between p-4 sm:p-6 lg:absolute lg:inset-x-0 lg:top-0 lg:z-20">
          <Link href="/" className="flex items-center gap-2 font-semibold lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
              <Activity className="h-5 w-5" />
            </span>
            {APP_NAME}
          </Link>
          <ThemeToggle />
        </header>

        <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <div className="mb-8 hidden text-center lg:block">
              <Link href="/" className="inline-flex items-center gap-2 font-semibold">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                  <Activity className="h-5 w-5" />
                </span>
                {APP_NAME}
              </Link>
            </div>

            <div className="glass-strong rounded-3xl p-8 shadow-glass-lg">
              <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                <p className="mt-2 text-sm text-muted">{subtitle}</p>
              </div>
              <ApiOfflineNotice />
              {children}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
