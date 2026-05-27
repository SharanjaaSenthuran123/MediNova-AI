import type { HealthReport, ReportStatus } from "@/types/health";

export interface ReportStats {
  total: number;
  normal: number;
  review: number;
  complete: number;
}

export function computeReportStats(reports: HealthReport[]): ReportStats {
  return {
    total: reports.length,
    normal: reports.filter((r) => r.status === "Normal").length,
    review: reports.filter((r) => r.status === "Review").length,
    complete: reports.filter((r) => r.status === "Complete").length,
  };
}

export function filterReports(
  reports: HealthReport[],
  statusFilter: "all" | ReportStatus,
  categoryFilter: string
): HealthReport[] {
  return reports.filter((report) => {
    const statusMatch =
      statusFilter === "all" || report.status === statusFilter;
    const categoryMatch =
      categoryFilter === "all" || report.category === categoryFilter;
    return statusMatch && categoryMatch;
  });
}

export function searchReports(
  reports: HealthReport[],
  query: string
): HealthReport[] {
  const q = query.trim().toLowerCase();
  if (!q) return reports;
  return reports.filter(
    (r) =>
      r.title.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.summary.toLowerCase().includes(q) ||
      r.provider?.toLowerCase().includes(q) ||
      r.highlights?.some((h) => h.toLowerCase().includes(q))
  );
}
