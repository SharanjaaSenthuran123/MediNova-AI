import { type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  minHeight?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
  minHeight = "min-h-[320px]",
}: EmptyStateProps) {
  return (
    <Card
      variant="gradient"
      className={cn(
        "flex h-full flex-col items-center justify-center text-center",
        minHeight,
        className
      )}
    >
      <span className="gradient-icon flex h-14 w-14 items-center justify-center rounded-2xl shadow-glow">
        <Icon className="h-7 w-7" />
      </span>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted">{description}</p>
    </Card>
  );
}
