import Link from "next/link";
import {
  Bell,
  Calendar,
  FileText,
  MessageSquare,
  ScanBarcode,
  Siren,
  Stethoscope,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const links = [
  {
    href: "/doctors",
    label: "Doctors",
    icon: Stethoscope,
    color: "text-primary",
  },
  {
    href: "/health-analytics",
    label: "Analytics",
    icon: FileText,
    color: "text-success",
  },
  {
    href: "/symptom-checker",
    label: "Symptom Checker",
    icon: Stethoscope,
    color: "text-primary",
  },
  {
    href: "/assistant",
    label: "AI Assistant",
    icon: MessageSquare,
    color: "text-secondary",
  },
  {
    href: "/prescription-reader",
    label: "Prescription OCR",
    icon: FileText,
    color: "text-secondary",
  },
  {
    href: "/barcode-scanner",
    label: "Smart Medicine Scanner",
    icon: ScanBarcode,
    color: "text-primary",
  },
  {
    href: "/reminders",
    label: "Reminders",
    icon: Bell,
    color: "text-warning",
  },
  {
    href: "/appointments",
    label: "Appointments",
    icon: Calendar,
    color: "text-primary",
  },
  {
    href: "/emergency",
    label: "Emergency SOS",
    icon: Siren,
    color: "text-danger",
  },
] as const;

export function DashboardQuickLinks() {
  return (
    <ul className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <li key={link.href}>
            <Link href={link.href}>
              <Card
                interactive
                className="flex h-full items-center gap-3 p-4"
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10",
                    link.color
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium">{link.label}</span>
              </Card>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
