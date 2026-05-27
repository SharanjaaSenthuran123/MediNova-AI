import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm transition-colors",
  {
    variants: {
      variant: {
        default:
          "border border-primary/20 bg-primary/10 text-primary",
        secondary:
          "border border-secondary/20 bg-secondary/10 text-secondary",
        success:
          "border border-success/20 bg-success/10 text-success",
        warning:
          "border border-warning/20 bg-warning/10 text-warning",
        danger:
          "border border-danger/20 bg-danger/10 text-danger",
        outline: "glass border-white/30 text-muted dark:border-white/10",
        glass: "glass border-white/30 text-foreground dark:border-white/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
