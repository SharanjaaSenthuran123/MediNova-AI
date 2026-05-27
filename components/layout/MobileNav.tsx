"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutDashboard,
  Siren,
  Stethoscope,
} from "lucide-react";
import { MOBILE_NAV_LINKS } from "@/lib/constants";
import { isNavActive } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const iconMap = {
  Home,
  LayoutDashboard,
  Stethoscope,
  ScanBarcode: Stethoscope,
  Siren,
};

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/20 glass-strong dark:border-white/10 lg:hidden"
      aria-label="Mobile dashboard"
    >
      <ul className="mx-auto flex max-w-lg items-center justify-around px-2 py-2 safe-area-pb">
        {MOBILE_NAV_LINKS.map((link) => {
          const Icon = iconMap[link.icon as keyof typeof iconMap] ?? LayoutDashboard;
          const active = isNavActive(pathname, link.href);

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-w-[4.5rem] flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200",
                  active
                    ? "nav-link-active scale-105 shadow-sm"
                    : "text-muted hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
