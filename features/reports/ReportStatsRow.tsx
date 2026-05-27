import { CheckCircle2, ClipboardList, Eye, FileCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { ReportStats } from "@/features/reports/report.helpers";

interface ReportStatsRowProps {
  stats: ReportStats;
}

const statItems = [
  { key: "total" as const, label: "Total reports", icon: ClipboardList },
  { key: "normal" as const, label: "Normal", icon: CheckCircle2 },
  { key: "review" as const, label: "Needs review", icon: Eye },
  { key: "complete" as const, label: "Complete", icon: FileCheck },
];

export function ReportStatsRow({ stats }: ReportStatsRowProps) {
  return (
    <section
      className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
      aria-label="Report summary"
    >
      {statItems.map(({ key, label, icon: Icon }) => (
        <Card key={key} className="flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-2xl font-bold tabular-nums">{stats[key]}</p>
            <p className="truncate text-xs text-muted">{label}</p>
          </div>
        </Card>
      ))}
    </section>
  );
}
