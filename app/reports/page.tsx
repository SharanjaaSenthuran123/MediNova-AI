import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { recentReports } from "@/data/dashboardStats";

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Health Reports"
        description="View your recent lab results and checkup summaries."
      />
      <ul className="space-y-4">
        {recentReports.map((report) => (
          <li key={report.id}>
            <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <section>
                <h3 className="font-semibold">{report.title}</h3>
                <p className="text-sm text-muted">{report.date}</p>
              </section>
              <Badge
                variant={
                  report.status === "Normal"
                    ? "success"
                    : report.status === "Review"
                      ? "warning"
                      : "outline"
                }
              >
                {report.status}
              </Badge>
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}
