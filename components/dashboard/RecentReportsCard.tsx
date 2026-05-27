import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/Badge";

import { Card } from "@/components/ui/Card";

import { recentReports } from "@/data/dashboardStats";



const statusVariant = {

  Normal: "success" as const,

  Review: "warning" as const,

  Complete: "outline" as const,

};



export function RecentReportsCard() {

  const preview = recentReports.slice(0, 3);



  return (

    <Card className="h-full">

      <section className="flex items-center justify-between">

        <h3 className="text-lg font-semibold">Recent Reports</h3>

        <Link

          href="/reports"

          className="inline-flex items-center gap-1 text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded"

        >

          View all

          <ArrowRight className="h-3.5 w-3.5" />

        </Link>

      </section>

      <ul className="mt-4 space-y-3">

        {preview.map((report) => (

          <li key={report.id}>

            <Link

              href={`/reports?report=${report.id}`}

              className="block rounded-xl border border-border px-4 py-3 transition-colors hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"

            >

              <section className="flex items-start justify-between gap-2">

                <section className="min-w-0">

                  <p className="font-medium">{report.title}</p>

                  <p className="text-sm text-muted">

                    {report.category} · {report.date}

                  </p>

                </section>

                <Badge variant={statusVariant[report.status]}>

                  {report.status}

                </Badge>

              </section>

            </Link>

          </li>

        ))}

      </ul>

    </Card>

  );

}


