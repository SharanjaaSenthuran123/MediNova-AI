import { type LucideIcon, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  description: string;
  icon?: LucideIcon;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  minHeight?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description,
  icon: Icon = AlertCircle,
  onRetry,
  retryLabel = "Try again",
  className,
  minHeight = "min-h-[240px]",
}: ErrorStateProps) {
  return (
    <Card
      className={cn(
        "flex h-full flex-col items-center justify-center border-danger/30 bg-danger/5 text-center",
        minHeight,
        className
      )}
      role="alert"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/10 text-danger">
        <Icon className="h-7 w-7" />
      </span>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted">{description}</p>
      {onRetry && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={onRetry}
        >
          {retryLabel}
        </Button>
      )}
    </Card>
  );
}
