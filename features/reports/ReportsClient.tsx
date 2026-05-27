"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ClipboardList, Download, Search } from "lucide-react";
import { ReportListItem } from "@/components/dashboard/ReportListItem";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { ReportFilterChips } from "@/features/reports/ReportFilterChips";
import { ReportStatsRow } from "@/features/reports/ReportStatsRow";
import {
  computeReportStats,
  filterReports,
  searchReports,
} from "@/features/reports/report.helpers";
import { recentReports } from "@/data/dashboardStats";
import type { HealthReport, ReportStatus } from "@/types/health";

interface ReportsClientProps {
  initialExpandedId?: string;
}

interface ReportsApiResponse {
  reports: HealthReport[];
  healthScore: number;
  generatedCount: number;
}

export function ReportsClient({ initialExpandedId }: ReportsClientProps) {
  const searchParams = useSearchParams();
  const reportFromUrl = searchParams.get("report");

  const [reports, setReports] = useState<HealthReport[]>(recentReports);
  const [healthScore, setHealthScore] = useState(82);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | ReportStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(
    initialExpandedId ?? reportFromUrl ?? null
  );

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/reports", { credentials: "include" });
        if (res.ok) {
          const data = (await res.json()) as ReportsApiResponse;
          setReports(data.reports);
          setHealthScore(data.healthScore);
        }
      } catch {
        /* keep static fallback */
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const stats = useMemo(() => computeReportStats(reports), [reports]);

  const filteredReports = useMemo(() => {
    const filtered = filterReports(reports, statusFilter, categoryFilter);
    return searchReports(filtered, searchQuery);
  }, [reports, statusFilter, categoryFilter, searchQuery]);

  function handleToggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function handleClearFilters() {
    setStatusFilter("all");
    setCategoryFilter("all");
    setSearchQuery("");
  }

  const handleDownloadSummary = useCallback(() => {
    const lines = [
      "MediNova-AI Health Report Summary",
      `Generated: ${new Date().toLocaleString()}`,
      `Health Score: ${healthScore}/100`,
      "",
      ...filteredReports.map(
        (r) =>
          `${r.title} (${r.date})\nStatus: ${r.status} · ${r.category}\n${r.summary}\n`
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `medinova-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredReports, healthScore]);

  const hasActiveFilters =
    statusFilter !== "all" || categoryFilter !== "all" || searchQuery.trim();

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonCard lines={2} />
        <SkeletonCard lines={4} />
        <SkeletonCard lines={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="glass-strong flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/15 px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Health Score Summary
          </p>
          <p className="text-3xl font-bold tabular-nums text-foreground">
            {healthScore}
            <span className="ml-1 text-lg font-medium text-muted">/100</span>
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleDownloadSummary}>
          <Download className="h-4 w-4" />
          Download summary
        </Button>
      </section>

      <ReportStatsRow stats={stats} />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input
          placeholder="Search reports by title, category, or summary…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          aria-label="Search reports"
        />
      </div>

      <ReportFilterChips
        statusFilter={statusFilter}
        categoryFilter={categoryFilter}
        onStatusChange={setStatusFilter}
        onCategoryChange={setCategoryFilter}
      />

      <p className="text-sm text-muted" aria-live="polite">
        Showing {filteredReports.length} of {reports.length} reports
        {hasActiveFilters ? " (filtered)" : ""}
      </p>

      {filteredReports.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No reports match these filters"
          description="Try a different search, status, or category — or run Symptom Checker, OCR, or barcode scans to generate new reports."
          minHeight="min-h-[240px]"
        />
      ) : (
        <ul className="space-y-4">
          {filteredReports.map((report) => (
            <li key={report.id}>
              <ReportListItem
                report={report}
                expanded={expandedId === report.id}
                onToggle={() => handleToggleExpand(report.id)}
              />
            </li>
          ))}
        </ul>
      )}

      {hasActiveFilters && filteredReports.length > 0 && (
        <button
          type="button"
          onClick={handleClearFilters}
          className="text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
