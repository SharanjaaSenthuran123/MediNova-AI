import { DashboardClient } from "@/features/dashboard/DashboardClient";
import { PageHeader } from "@/components/ui/PageHeader";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Premium Analytics"
        title="Health Command Center"
        description="Live vitals simulation, AI risk scoring, animated charts, and glassmorphism healthcare insights."
        action={
          <Link href="/symptom-checker">
            <Button size="sm">
              Symptom Check
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        }
      />

      <DisclaimerBanner>
        Dashboard metrics use live simulated vitals for demo presentations — not
        connected to real medical devices. Add OPENAI_API_KEY or GEMINI_API_KEY for
        live AI insights.
      </DisclaimerBanner>

      <DashboardClient />
    </>
  );
}
