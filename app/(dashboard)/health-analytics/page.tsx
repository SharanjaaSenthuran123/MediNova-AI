import { HealthAnalyticsClient } from "@/features/health-analytics/HealthAnalyticsClient";
import { PageHeader } from "@/components/ui/PageHeader";

export default function HealthAnalyticsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Insights"
        title="Health Analytics"
        description="AI prediction charts, recovery analytics, and smart medical reports."
      />
      <HealthAnalyticsClient />
    </>
  );
}
