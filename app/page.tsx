import Link from "next/link";
import {
  ArrowRight,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { FeatureCard } from "@/components/healthcare/FeatureCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { homepageFeatures, howItWorksSteps } from "@/data/homepageFeatures";
import { healthStats, trustStats } from "@/data/dashboardStats";
import { APP_TAGLINE, APP_DESCRIPTION } from "@/lib/constants";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="gradient-hero border-b border-border">
          <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <section className="mx-auto max-w-3xl text-center">
              <Badge variant="secondary" className="mb-4">
                <Sparkles className="mr-1 inline h-3 w-3" />
                AI-assisted • Emergency-ready • Privacy-first
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                <span className="text-gradient">{APP_TAGLINE}</span>
              </h1>
              <p className="mt-6 text-lg text-muted sm:text-xl">
                {APP_DESCRIPTION}
              </p>
              <section className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/symptom-checker">
                  <Button size="lg">
                    Start Health Check
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" size="lg">
                    View Dashboard
                  </Button>
                </Link>
              </section>
            </section>

            {/* Trust stats */}
            <ul className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
              {trustStats.map((stat) => (
                <li key={stat.label}>
                  <Card className="text-center">
                    <p className="text-2xl font-bold text-primary">{stat.value}</p>
                    <p className="mt-1 text-sm text-muted">{stat.label}</p>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        </section>

        {/* Features */}
        <section id="features" className="py-20">
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <section className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold">Core Healthcare Features</h2>
              <p className="mt-3 text-muted">
                Everything you need for a strong hackathon demo — symptom AI,
                OCR, barcode scan, emergency SOS, and analytics.
              </p>
            </section>
            <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {homepageFeatures.map((feature) => (
                <li key={feature.title}>
                  <FeatureCard feature={feature} />
                </li>
              ))}
            </ul>
          </section>
        </section>

        {/* Dashboard preview */}
        <section className="border-y border-border bg-card/50 py-20">
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <section className="grid items-center gap-12 lg:grid-cols-2">
              <section>
                <Badge className="mb-4">Dashboard Preview</Badge>
                <h2 className="text-3xl font-bold">
                  Your health control center
                </h2>
                <p className="mt-4 text-muted">
                  Track heart rate, sleep, medicine adherence, and reports in a
                  professional analytics layout with Chart.js insights.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-muted">
                  <li className="flex items-center gap-2">
                    <HeartPulse className="h-4 w-4 text-primary" />
                    Real-time style health metrics (mock data)
                  </li>
                  <li className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-primary" />
                    Connected to AI Symptom Checker
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    Privacy-first demo design
                  </li>
                </ul>
                <Link href="/dashboard" className="mt-8 inline-block">
                  <Button>
                    Open Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </section>
              <ul className="grid gap-4 sm:grid-cols-2">
                {healthStats.map((stat) => (
                  <li key={stat.id}>
                    <StatCard stat={stat} />
                  </li>
                ))}
              </ul>
            </section>
          </section>
        </section>

        {/* How it works */}
        <section className="py-20">
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl font-bold">How MediNova Works</h2>
            <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {howItWorksSteps.map((item) => (
                <li key={item.step}>
                  <Card className="h-full">
                    <span className="text-3xl font-bold text-primary/30">
                      {item.step}
                    </span>
                    <h3 className="mt-4 font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted">{item.description}</p>
                  </Card>
                </li>
              ))}
            </ol>
          </section>
        </section>

        {/* Safety */}
        <section className="border-t border-border bg-primary/5 py-12">
          <section className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-4 text-xl font-semibold">Safety & Disclaimer</h2>
            <p className="mt-3 text-sm text-muted">
              MediNova-AI is for educational and hackathon demo purposes. It does
              not provide medical diagnosis. Always consult a qualified healthcare
              professional for medical decisions. Emergency SOS is a simulation
              unless integrated with real alert providers.
            </p>
          </section>
        </section>

        {/* CTA */}
        <section className="py-20">
          <Card className="mx-auto max-w-4xl bg-gradient-to-br from-primary/10 to-secondary/10 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Ready to explore your health?
            </h2>
            <p className="mt-3 text-muted">
              Start with the dashboard or try the AI Symptom Checker now.
            </p>
            <Link href="/dashboard" className="mt-6 inline-block">
              <Button size="lg">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </Card>
        </section>
      </main>
      <Footer />
    </>
  );
}
