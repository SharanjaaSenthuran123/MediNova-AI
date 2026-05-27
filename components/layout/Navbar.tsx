"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Activity, Menu, X } from "lucide-react";
import { NAV_LINKS, NAV_MENU_LINKS, APP_NAME } from "@/lib/constants";
import { isNavActive } from "@/lib/navigation";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function closeMenu() {
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 glass-strong dark:border-white/10">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2 font-semibold text-foreground transition-opacity hover:opacity-90"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow transition-transform duration-300 group-hover:scale-105">
            <Activity className="h-5 w-5" />
          </span>
          <span className="hidden sm:inline">{APP_NAME}</span>
        </Link>

        <nav
          className="hidden flex-1 items-center justify-center gap-1 xl:flex"
          aria-label="Main"
        >
          {NAV_LINKS.map((link) => {
            const active = isNavActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
                  active
                    ? "nav-link-active"
                    : "text-muted hover:bg-white/40 hover:text-foreground dark:hover:bg-white/5"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 xl:flex">
          <ThemeToggle />
          <ButtonLink href="/symptom-checker" variant="primary" size="sm">
            Start Health Check
          </ButtonLink>
        </div>

        <div className="flex shrink-0 items-center gap-2 xl:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/20 glass animate-fade-in xl:hidden dark:border-white/10">
          <nav className="flex flex-col gap-1 p-4" aria-label="Mobile main">
            {[...NAV_LINKS, ...NAV_MENU_LINKS].map((link) => {
              const active = isNavActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  onClick={closeMenu}
                  className={cn(
                    "rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    active
                      ? "nav-link-active"
                      : "text-muted hover:bg-white/40 hover:text-foreground dark:hover:bg-white/5"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="mt-3 flex flex-col gap-2 border-t border-white/20 pt-3 dark:border-white/10">
              <ButtonLink
                href="/symptom-checker"
                className="w-full"
                onClick={closeMenu}
              >
                Start Health Check
              </ButtonLink>
              <ButtonLink
                href="/dashboard"
                variant="outline"
                className="w-full"
                onClick={closeMenu}
              >
                Open Dashboard
              </ButtonLink>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
