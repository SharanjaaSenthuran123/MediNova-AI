import { reportCategoryFilters, reportStatusFilters } from "@/data/reportFilters";
import type { ReportStatus } from "@/types/health";
import { cn } from "@/lib/utils";

interface ReportFilterChipsProps {
  statusFilter: "all" | ReportStatus;
  categoryFilter: string;
  onStatusChange: (status: "all" | ReportStatus) => void;
  onCategoryChange: (category: string) => void;
}

export function ReportFilterChips({
  statusFilter,
  categoryFilter,
  onStatusChange,
  onCategoryChange,
}: ReportFilterChipsProps) {
  return (
    <section className="space-y-4" aria-label="Filter reports">
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
          Status
        </p>
        <ul className="flex flex-wrap gap-2">
          {reportStatusFilters.map((filter) => (
            <li key={filter.id}>
              <button
                type="button"
                aria-pressed={statusFilter === filter.id}
                onClick={() => onStatusChange(filter.id)}
                className={cn(
                  "rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors",
                  "hover:border-primary/40 hover:bg-primary/5",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                  statusFilter === filter.id &&
                    "border-primary/50 bg-primary/10 text-primary"
                )}
              >
                {filter.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
          Category
        </p>
        <ul className="flex flex-wrap gap-2">
          {reportCategoryFilters.map((filter) => (
            <li key={filter.id}>
              <button
                type="button"
                aria-pressed={categoryFilter === filter.id}
                onClick={() => onCategoryChange(filter.id)}
                className={cn(
                  "rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors",
                  "hover:border-primary/40 hover:bg-primary/5",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                  categoryFilter === filter.id &&
                    "border-primary/50 bg-primary/10 text-primary"
                )}
              >
                {filter.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
