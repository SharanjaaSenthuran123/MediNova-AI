import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  centered?: boolean;
}

export function SectionHeading({
  title,
  description,
  action,
  className,
  centered = false,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between",
        centered && "items-center text-center sm:flex-col sm:items-center",
        className
      )}
    >
      <div className={cn(centered && "max-w-2xl")}>
        <h2
          className={cn(
            "text-lg font-semibold tracking-tight",
            centered ? "text-foreground" : "text-gradient"
          )}
        >
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-muted">{description}</p>
        )}
        <div
          className={cn(
            "mt-2 h-0.5 w-12 rounded-full bg-gradient-to-r from-primary to-accent",
            centered && "mx-auto"
          )}
          aria-hidden
        />
      </div>
      {action}
    </div>
  );
}
