import { emergencyScenarios } from "@/data/emergencyScenarios";
import { cn } from "@/lib/utils";

interface EmergencyDemoChipsProps {
  onSelect: (skipCountdown: boolean) => void;
  disabled?: boolean;
  activeId?: string | null;
}

export function EmergencyDemoChips({
  onSelect,
  disabled,
  activeId,
}: EmergencyDemoChipsProps) {
  return (
    <section>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
        Demo scenarios
      </p>
      <ul className="flex flex-wrap gap-2">
        {emergencyScenarios.map((scenario) => (
          <li key={scenario.id}>
            <button
              type="button"
              disabled={disabled}
              title={scenario.description}
              onClick={() => onSelect(scenario.skipCountdown)}
              className={cn(
                "rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-all",
                "hover:border-danger/50 hover:bg-danger/10 hover:shadow-[0_0_16px_rgb(239_68_68_/_0.2)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40",
                "disabled:cursor-not-allowed disabled:opacity-50",
                activeId === scenario.id && "border-danger/60 bg-danger/15 shadow-[0_0_12px_rgb(239_68_68_/_0.25)]"
              )}
            >
              {scenario.label}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
