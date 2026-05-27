import type { ReportStatus } from "@/types/health";

export const reportStatusFilters: { id: "all" | ReportStatus; label: string }[] = [
  { id: "all", label: "All statuses" },
  { id: "Normal", label: "Normal" },
  { id: "Review", label: "Review" },
  { id: "Complete", label: "Complete" },
];

export const reportCategoryFilters = [
  { id: "all", label: "All categories" },
  { id: "Lab", label: "Lab" },
  { id: "Checkup", label: "Checkup" },
  { id: "Imaging", label: "Imaging" },
] as const;
