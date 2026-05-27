import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  FileText,
  LayoutDashboard,
  ScanBarcode,
  Siren,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { FeatureItem } from "@/types/health";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  Stethoscope,
  FileText,
  ScanBarcode,
  Siren,
  LayoutDashboard,
  Activity,
};

interface PremiumFeatureCardProps {
  feature: FeatureItem;
  className?: string;
}

export function PremiumFeatureCard({
  feature,
  className,
}: PremiumFeatureCardProps) {
  const Icon = iconMap[feature.icon] ?? Activity;

  return (
    <Link href={feature.href} className="group block h-full">
      <article
        className={cn(
          "feature-card-border relative h-full overflow-hidden rounded-2xl",
          className
        )}
      >
        <div className="relative flex h-full flex-col glass p-6 transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-glow-lg">
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition-opacity duration-500 opacity-0 group-hover:opacity-100"
            aria-hidden
          />

          <div className="relative flex items-start justify-between">
            <span className="gradient-icon flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow">
              <Icon className="h-6 w-6" />
            </span>
            {feature.badge && (
              <Badge variant="secondary" className="relative">
                {feature.badge}
              </Badge>
            )}
          </div>

          <h3 className="relative mt-4 flex items-center gap-2 text-lg font-semibold transition-colors group-hover:text-primary">
            {feature.title}
            <ArrowUpRight className="h-4 w-4 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
          </h3>

          <p className="relative mt-2 flex-1 text-sm leading-relaxed text-muted">
            {feature.description}
          </p>

          <span className="relative mt-4 inline-flex text-xs font-medium text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            Explore feature →
          </span>
        </div>
      </article>
    </Link>
  );
}
