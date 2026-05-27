"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity,
  Apple,
  Bell,
  Calendar,
  ClipboardList,
  CreditCard,
  Droplet,
  FileText,
  History,
  Home,
  LayoutDashboard,
  Lightbulb,
  LineChart,
  MapPin,
  MessageSquare,
  Pill,
  ScanBarcode,
  Settings,
  Shield,
  Siren,
  Stethoscope,
  UserCircle,
  UserRound,
  Users,
} from "lucide-react";
import { APP_NAME, SIDEBAR_LINKS } from "@/lib/constants";
import { isNavActive } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const iconMap = {
  Home,
  LayoutDashboard,
  Stethoscope,
  Users,
  UserRound,
  Calendar,
  FileText,
  ScanBarcode,
  Siren,
  LineChart,
  Apple,
  Pill,
  Droplet,
  CreditCard,
  Shield,
  Lightbulb,
  MapPin,
  ClipboardList,
  MessageSquare,
  Bell,
  History,
  Settings,
  UserCircle,
};

export function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then((r) => r.json())
      .then((data: { user?: { role: string } | null }) => {
        setRole(data.user?.role ?? null);
      })
      .catch(() => undefined);
  }, []);

  const links = SIDEBAR_LINKS.filter(
    (link) => !("adminOnly" in link && link.adminOnly) || role === "admin"
  );

  return (
    <aside className="hidden w-64 shrink-0 border-r border-white/20 glass-strong dark:border-white/10 lg:block">
      <section className="flex h-16 items-center gap-2 border-b border-white/20 px-6 dark:border-white/10">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
          <Activity className="h-5 w-5" />
        </span>
        <span className="font-semibold">{APP_NAME}</span>
      </section>

      <nav className="max-h-[calc(100vh-4rem)] space-y-1 overflow-y-auto p-4" aria-label="Dashboard">
        {links.map((link) => {
          const Icon = iconMap[link.icon as keyof typeof iconMap] ?? LayoutDashboard;
          const active = isNavActive(pathname, link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "nav-link-active shadow-sm"
                  : "text-muted hover:bg-white/40 hover:text-foreground dark:hover:bg-white/5"
              )}
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-primary to-secondary"
                  aria-hidden
                />
              )}
              <Icon className={cn("h-5 w-5 shrink-0", active && "text-primary")} />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
