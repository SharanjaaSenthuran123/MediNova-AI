import { PremiumFeatureCard } from "@/components/homepage/PremiumFeatureCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { homepageFeatures } from "@/data/homepageFeatures";

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
        aria-hidden
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          centered
          title="Core healthcare features"
          description="Premium feature cards with hover glow and animated borders — five connected tools built for a world-class demo."
          className="mb-14 [&_h2]:text-3xl [&_h2]:font-bold"
        />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {homepageFeatures.map((feature, index) => (
            <li
              key={feature.title}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <PremiumFeatureCard feature={feature} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
