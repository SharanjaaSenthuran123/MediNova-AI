import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-glow-lg hover:brightness-110 active:scale-[0.98]",
        secondary:
          "bg-gradient-to-r from-secondary to-blue-600 text-secondary-foreground shadow-md hover:shadow-glow hover:brightness-110 active:scale-[0.98]",
        outline:
          "glass border-white/40 text-foreground hover:border-primary/40 hover:bg-primary/5 dark:border-white/10",
        ghost: "text-foreground hover:bg-primary/10",
        danger:
          "bg-gradient-to-r from-danger to-red-600 text-white shadow-md hover:brightness-110 active:scale-[0.98]",
        glass:
          "glass text-foreground hover:border-primary/30 hover:bg-primary/5",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export { buttonVariants };

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";
