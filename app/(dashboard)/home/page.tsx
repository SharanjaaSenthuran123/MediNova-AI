import { ArrowRight } from "lucide-react";
import { DashboardPreviewSection } from "@/components/homepage/DashboardPreviewSection";
import { FeaturesSection } from "@/components/homepage/FeaturesSection";
import { FinalCTASection } from "@/components/homepage/FinalCTASection";
import { HeroSection } from "@/components/homepage/HeroSection";
import { HowItWorksSection } from "@/components/homepage/HowItWorksSection";
import { SafetySection } from "@/components/homepage/SafetySection";
import { TrustStrip } from "@/components/homepage/TrustStrip";
import { LiveStatsSection } from "@/components/home/LiveStatsSection";
import { DoctorsShowcase } from "@/components/home/DoctorsShowcase";
import { EmergencyBanner } from "@/components/home/EmergencyBanner";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { TechShowcase } from "@/components/home/TechShowcase";
import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/ButtonLink";

export default function HomeLandingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Smart Healthcare Ecosystem"
        title="Welcome to MediNova"
        description="Your AI-powered healthcare command center — monitor, diagnose, and care with confidence."
        action={
          <ButtonLink href="/dashboard" size="sm">
            Open Dashboard
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        }
      />

      <div className="-mx-4 sm:-mx-6">
        <HeroSection />
        <LiveStatsSection />
        <TrustStrip />
        <DoctorsShowcase />
        <FeaturesSection />
        <EmergencyBanner />
        <DashboardPreviewSection />
        <TechShowcase />
        <HowItWorksSection />
        <TestimonialsSection />
        <SafetySection />
        <FinalCTASection />
      </div>
    </>
  );
}
