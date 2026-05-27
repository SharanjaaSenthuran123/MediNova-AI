import { type ReactNode } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { type LucideIcon } from "lucide-react";

interface FeaturePageShellProps {
  title: string;
  description: string;
  eyebrow?: string;
  action?: ReactNode;
  disclaimer?: ReactNode;
  disclaimerVariant?: "default" | "warning" | "danger";
  disclaimerIcon?: LucideIcon;
  children: ReactNode;
}

/** Standard layout for healthcare tool pages: header → disclaimer → content. */
export function FeaturePageShell({
  title,
  description,
  eyebrow,
  action,
  disclaimer,
  disclaimerVariant = "default",
  disclaimerIcon,
  children,
}: FeaturePageShellProps) {
  return (
    <>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        action={action}
      />

      {disclaimer && (
        <DisclaimerBanner variant={disclaimerVariant} icon={disclaimerIcon}>
          {disclaimer}
        </DisclaimerBanner>
      )}

      {children}
    </>
  );
}
