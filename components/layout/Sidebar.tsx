"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ClipboardList,
  FileText,
  LayoutDashboard,
  ScanBarcode,
  Settings,
  Siren,
  Stethoscope,
} from "lucide-react";
import { APP_NAME, SIDEBAR_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const iconMap = {
  LayoutDashboard,
  Stethoscope,
  FileText,
  ScanBarcode,
  Siren,
  ClipboardList,
  Settings,
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
      <section className="flex h-16 items-center gap-2 border-b border-border px-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Activity className="h-5 w-5" />
        </span>
        <span className="font-semibold">{APP_NAME}</span>
      </section>

      <nav className="space-y-1 p-4">
        {SIDEBAR_LINKS.map((link) => {
          const Icon = iconMap[link.icon as keyof typeof iconMap] ?? LayoutDashboard;
          const active = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted hover:bg-primary/5 hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {link.label}
            </Link>
          );
        })}
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted hover:bg-primary/5 hover:text-foreground"
          )}
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
      </nav>
    </aside>
  );
}
