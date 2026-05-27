"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Bot,
  ChevronDown,
  LogOut,
  Search,
  Settings,
  Siren,
  UserCircle,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/types/auth";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  urgent: boolean;
  read?: boolean;
  createdAt: string;
}

export function TopNavbar() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => setUser(null));

    fetch("/api/notifications", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { notifications: [] }))
      .then((d: { notifications?: NotificationItem[] }) =>
        setNotifications(d.notifications ?? [])
      )
      .catch(() => setNotifications([]));
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 hidden border-b border-white/20 glass-strong px-6 dark:border-white/10 lg:block">
      <div className="flex h-16 items-center gap-4">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder="Search patients, doctors, records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl glass-input pl-10 pr-4 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <div ref={notifRef} className="relative">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfile(false);
              }}
            >
              <span className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                  {notifications.filter((n) => !n.read).length || notifications.length}
                </span>
              </span>
            </Button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute right-0 top-full mt-2 w-80 rounded-2xl glass-strong p-2 shadow-glass-lg"
                >
                  <p className="px-3 py-2 text-sm font-semibold">Notifications</p>
                  {notifications.length === 0 ? (
                    <p className="px-3 py-4 text-sm text-muted">No notifications yet</p>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        className={cn(
                          "w-full rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-primary/5",
                          n.urgent && "border-l-2 border-danger"
                        )}
                      >
                        <p className="font-medium">{n.title}</p>
                        <p className="text-xs text-muted">{n.body}</p>
                      </button>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link href="/emergency">
            <Button variant="danger" size="sm" className="gap-1.5">
              <Siren className="h-4 w-4" />
              Emergency
            </Button>
          </Link>

          <Link href="/assistant">
            <Button variant="secondary" size="sm" className="gap-1.5">
              <Bot className="h-4 w-4" />
              AI Assistant
            </Button>
          </Link>

          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 rounded-xl glass px-3 py-2 transition-colors hover:bg-primary/5"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-xs font-bold text-white">
                {user?.avatarInitials ?? "U"}
              </span>
              <span className="hidden text-sm font-medium xl:block">
                {user?.name ?? "User"}
              </span>
              <ChevronDown className="h-4 w-4 text-muted" />
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute right-0 top-full mt-2 w-56 rounded-2xl glass-strong p-2 shadow-glass-lg"
                >
                  <div className="border-b border-border/60 px-3 py-2">
                    <p className="text-sm font-semibold">{user?.name}</p>
                    <p className="text-xs capitalize text-muted">{user?.role}</p>
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-primary/5"
                  >
                    <UserCircle className="h-4 w-4" />
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-primary/5"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-danger hover:bg-danger/5"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
