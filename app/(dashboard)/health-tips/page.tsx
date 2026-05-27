import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { Button } from "@/components/ui/Button";
import { HealthTipsClient } from "@/features/health-tips/HealthTipsClient";

export default function HealthTipsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Wellness"
        title="AI Health Tips"
        description="Personalized hydration, sleep, exercise, and wellness suggestions — refreshed with live AI or smart demo fallbacks."
        action={
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        }
      />

      <DisclaimerBanner>
        Tips are for general wellness education only — not medical advice. Consult a
        healthcare professional for personal guidance.
      </DisclaimerBanner>

      <HealthTipsClient />
    </>
  );
}
