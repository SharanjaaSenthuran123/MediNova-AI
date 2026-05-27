import Link from "next/link";
import { ArrowRight, HeartPulse, Moon, Sparkles, Stethoscope } from "lucide-react";
import { AIHealthcareIllustration } from "@/components/homepage/AIHealthcareIllustration";
import { FloatingMedicalIcons } from "@/components/homepage/FloatingMedicalIcons";
import { HeroStats } from "@/components/homepage/HeroStats";
import { LiveAIAnalysis } from "@/components/homepage/LiveAIAnalysis";
import { TrustBadges } from "@/components/homepage/TrustBadges";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { heroQuickLinks } from "@/data/homepageFeatures";
import { patientSummary } from "@/data/dashboardStats";
import { APP_TAGLINE, APP_DESCRIPTION } from "@/lib/constants";

export function HeroSection() {
  return (
    <section className="hero-animated-bg relative overflow-hidden border-b border-white/20 dark:border-white/10">
      <FloatingMedicalIcons />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="animate-fade-in-up">
            <Badge variant="glass" className="mb-4">
              <Sparkles className="mr-1 inline h-3 w-3 text-primary" />
              Healthcare AI demo platform
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
              <span className="text-gradient">{APP_TAGLINE}</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted sm:text-xl">
              {APP_DESCRIPTION}
            </p>

            <TrustBadges className="mt-6" />

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <ButtonLink href="/symptom-checker" size="lg">
                Start Health Check
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/dashboard" variant="outline" size="lg">
                View Dashboard
              </ButtonLink>
            </div>

            <nav
              className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm"
              aria-label="Quick feature links"
            >
              {heroQuickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-muted underline-offset-4 transition-colors hover:text-primary hover:underline"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <HeroStats />
          </div>

          <div
            className="relative mx-auto w-full max-w-lg animate-fade-in-up lg:max-w-none"
            style={{ animationDelay: "0.15s" }}
          >
            <AIHealthcareIllustration />

            <div className="relative mx-auto mt-6 max-w-md space-y-4 lg:max-w-none">
              <Card variant="elevated" className="relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                <div className="flex items-center gap-3 border-b border-white/20 pb-4 dark:border-white/10">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-semibold text-white shadow-glow">
                    {patientSummary.avatarInitials}
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">
                      {patientSummary.name}
                    </p>
                    <p className="text-xs text-muted">
                      Health score {patientSummary.healthScore}/100 · Risk{" "}
                      {patientSummary.riskScore}/100
                    </p>
                  </div>
                  <Badge variant="success" className="ml-auto">
                    Low risk
                  </Badge>
                </div>

                <ul className="mt-4 grid grid-cols-2 gap-3">
                  <li className="glass rounded-xl p-3 transition-transform duration-300 hover:scale-[1.02]">
                    <HeartPulse className="h-4 w-4 text-primary" />
                    <p className="mt-2 text-xl font-bold">72</p>
                    <p className="text-xs text-muted">Heart rate bpm</p>
                  </li>
                  <li className="glass rounded-xl p-3 transition-transform duration-300 hover:scale-[1.02]">
                    <Moon className="h-4 w-4 text-secondary" />
                    <p className="mt-2 text-xl font-bold">86%</p>
                    <p className="text-xs text-muted">Sleep score</p>
                  </li>
                </ul>

                <div className="mt-4 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-accent/5 p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                    <Stethoscope className="h-3.5 w-3.5" />
                    AI health insight
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    Sleep improved 5% this week. Medicine adherence is strong at
                    94%.
                  </p>
                </div>
              </Card>

              <LiveAIAnalysis />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
