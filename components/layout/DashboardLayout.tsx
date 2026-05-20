import { type ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <section className="flex min-h-screen bg-background">
      <Sidebar />
      <section className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 sm:px-6 lg:hidden">
          <span className="text-sm font-semibold">MediNova Dashboard</span>
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-auto p-4 pb-24 sm:p-6 lg:pb-6">
          {children}
        </main>
        <MobileNav />
      </section>
    </section>
  );
}
