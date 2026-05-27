import Link from "next/link";
import {
  Activity,
  FileText,
  LayoutDashboard,
  ScanBarcode,
  ShieldCheck,
  Siren,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { FeatureItem } from "@/types/health";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  Stethoscope,
  FileText,
  ScanBarcode,
  Siren,
  LayoutDashboard,
  ShieldCheck,
  Activity,
};

interface FeatureCardProps {
  feature: FeatureItem;
  className?: string;
}

export function FeatureCard({ feature, className }: FeatureCardProps) {
  const Icon = iconMap[feature.icon] ?? Activity;

  return (
    <Link href={feature.href} className="group block h-full">
      <Card interactive className={cn("relative h-full overflow-hidden", className)}>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <section className="flex items-start justify-between">
          <span className="gradient-icon flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110">
            <Icon className="h-6 w-6" />
          </span>
          {feature.badge && <Badge variant="secondary">{feature.badge}</Badge>}
        </section>
        <h3 className="mt-4 text-lg font-semibold transition-colors group-hover:text-primary">
          {feature.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {feature.description}
        </p>
      </Card>
    </Link>
  );
}
