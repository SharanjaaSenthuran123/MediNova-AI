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
    <Link href={feature.href}>
      <Card className={cn("card-hover h-full", className)}>
        <section className="flex items-start justify-between">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-6 w-6" />
          </span>
          {feature.badge && <Badge variant="secondary">{feature.badge}</Badge>}
        </section>
        <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {feature.description}
        </p>
      </Card>
    </Link>
  );
}
