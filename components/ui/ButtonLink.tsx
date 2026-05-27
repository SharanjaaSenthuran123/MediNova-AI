import Link from "next/link";
import { type ComponentProps } from "react";
import { buttonVariants, type ButtonProps } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type ButtonLinkProps = ComponentProps<typeof Link> &
  Pick<ButtonProps, "variant" | "size">;

/** Styled link that looks like a Button — avoids nested `<a><button>`. */
export function ButtonLink({
  className,
  variant,
  size,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </Link>
  );
}
