"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ScanBarcode,
  Siren,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mobileLinks = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/symptom-checker", label: "Symptoms", icon: Stethoscope },
  { href: "/barcode-scanner", label: "Scan", icon: ScanBarcode },
  { href: "/emergency", label: "SOS", icon: Siren },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-md lg:hidden">
      <ul className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {mobileLinks.map((link) => {
          const Icon = link.icon;
          const active =
            pathname === link.href || pathname.startsWith(link.href + "/");

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium",
                  active ? "text-primary" : "text-muted"
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
