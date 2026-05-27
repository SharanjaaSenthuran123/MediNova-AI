import { type ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { DemoModeNotice } from "@/components/layout/DemoModeNotice";
import { PageContainer } from "@/components/layout/PageContainer";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { APP_NAME } from "@/lib/constants";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <section className="relative flex min-h-screen">
      <Sidebar />
      <section className="flex flex-1 flex-col">
        <TopNavbar />
        <header className="flex h-14 items-center justify-between border-b border-white/20 glass-strong px-4 dark:border-white/10 lg:hidden">
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-sm font-semibold text-transparent">
            {APP_NAME}
          </span>
          <ThemeToggle />
        </header>
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-auto p-4 pb-24 sm:p-6 lg:pb-6 focus:outline-none"
        >
          <PageContainer>
            <DemoModeNotice />
            {children}
          </PageContainer>
        </main>
        <MobileNav />
      </section>
    </section>
  );
}
