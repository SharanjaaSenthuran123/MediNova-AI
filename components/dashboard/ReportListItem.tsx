import { ChevronDown, Building2 } from "lucide-react";

import { Badge } from "@/components/ui/Badge";

import { Card } from "@/components/ui/Card";

import type { HealthReport } from "@/types/health";

import { cn } from "@/lib/utils";



const statusVariant = {

  Normal: "success" as const,

  Review: "warning" as const,

  Complete: "outline" as const,

};



interface ReportListItemProps {

  report: HealthReport;

  expanded?: boolean;

  onToggle?: () => void;

}



export function ReportListItem({

  report,

  expanded,

  onToggle,

}: ReportListItemProps) {

  const isExpandable = Boolean(onToggle);

  const showDetails = expanded && report.highlights && report.highlights.length > 0;



  return (

    <Card className="overflow-hidden">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <section className="min-w-0 flex-1">

          <div className="flex flex-wrap items-center gap-2">

            {isExpandable ? (

              <button

                type="button"

                id={`report-toggle-${report.id}`}

                aria-expanded={expanded}

                aria-controls={`report-details-${report.id}`}

                onClick={onToggle}

                className={cn(

                  "flex items-center gap-1.5 text-left font-semibold transition-colors",

                  "hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded"

                )}

              >

                {report.title}

                <ChevronDown

                  className={cn(

                    "h-4 w-4 shrink-0 text-muted transition-transform",

                    expanded && "rotate-180"

                  )}

                  aria-hidden

                />

              </button>

            ) : (

              <h3 className="font-semibold">{report.title}</h3>

            )}

            <Badge variant="outline" className="text-xs">

              {report.category}

            </Badge>

          </div>

          <p className="mt-1 text-sm text-muted">{report.date}</p>

          {report.provider && (

            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">

              <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden />

              {report.provider}

            </p>

          )}

          <p className="mt-3 text-sm leading-relaxed text-muted">

            {report.summary}

          </p>

        </section>

        <Badge variant={statusVariant[report.status]} className="shrink-0 self-start">

          {report.status}

        </Badge>

      </div>



      {showDetails && (

        <section

          id={`report-details-${report.id}`}

          role="region"

          aria-labelledby={`report-toggle-${report.id}`}

          className="mt-4 border-t border-border pt-4"

        >

          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">

            Key findings

          </p>

          <ul className="space-y-2">

            {report.highlights!.map((item) => (

              <li

                key={item}

                className="flex items-start gap-2 text-sm text-muted"

              >

                <span

                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"

                  aria-hidden

                />

                {item}

              </li>

            ))}

          </ul>

        </section>

      )}

    </Card>

  );

}


