import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";

export function FinalCTASection() {
  return (
    <section className="py-20">
      <Card
        variant="gradient"
        className="relative mx-auto max-w-4xl overflow-hidden text-center"
      >
        <div
          className="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full bg-primary/30 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-secondary/25 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <h2 className="text-2xl font-bold sm:text-3xl">
            <span className="text-gradient">Ready to explore your health?</span>
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted">
            Start with the AI Symptom Checker or jump straight into the dashboard
            — every feature is connected in this demo ecosystem.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <ButtonLink href="/symptom-checker" size="lg">
              Start Health Check
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/dashboard" variant="outline" size="lg">
              View Dashboard
            </ButtonLink>
          </div>
        </div>
      </Card>
    </section>
  );
}
