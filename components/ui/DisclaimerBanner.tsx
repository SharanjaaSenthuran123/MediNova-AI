import { type ReactNode } from "react";
import { ShieldCheck, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DisclaimerBannerProps {
  children: ReactNode;
  icon?: LucideIcon;
  variant?: "default" | "warning" | "danger";
  className?: string;
}

const variantStyles = {
  default: "glass border-white/30 text-muted dark:border-white/10",
  warning: "glass border-warning/30 bg-warning/10 text-muted",
  danger: "glass border-danger/30 bg-danger/10 text-muted",
};

export function DisclaimerBanner({
  children,
  icon: Icon = ShieldCheck,
  variant = "default",
  className,
}: DisclaimerBannerProps) {
  return (
    <p
      className={cn(
        "mb-6 flex items-start gap-2 rounded-xl px-4 py-3 text-sm backdrop-blur-md",
        variantStyles[variant],
        className
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <span>{children}</span>
    </p>
  );
}
