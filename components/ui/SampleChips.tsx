import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SampleChipsProps {
  label: string;
  items: { id: string; label: string }[];
  onSelect: (id: string) => void;
  disabled?: boolean;
  className?: string;
}

export function SampleChips({
  label,
  items,
  onSelect,
  disabled,
  className,
}: SampleChipsProps) {
  return (
    <section className={className}>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSelect(item.id)}
              className={cn(
                "rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors",
                "hover:border-primary/40 hover:bg-primary/5",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export type { LucideIcon };
