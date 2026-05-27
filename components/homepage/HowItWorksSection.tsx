import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { howItWorksSteps } from "@/data/homepageFeatures";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          centered
          title="How MediNova works"
          description="From symptom input to dashboard tracking — a clear four-step flow for judges and users."
          className="mb-12 [&_h2]:text-3xl [&_h2]:font-bold"
        />
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {howItWorksSteps.map((item, index) => (
            <li
              key={item.step}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Card className="relative h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-glow">
                <span
                  className="bg-gradient-to-br from-primary/30 to-accent/20 bg-clip-text text-4xl font-bold text-transparent"
                  aria-hidden
                >
                  {item.step}
                </span>
                <h3 className="mt-2 font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
              </Card>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
