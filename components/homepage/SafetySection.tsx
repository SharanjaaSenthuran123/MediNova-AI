import { ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function SafetySection() {
  return (
    <section className="border-t border-white/20 py-14 dark:border-white/10">
      <Card variant="gradient" className="mx-auto max-w-3xl text-center">
        <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
        <h2 className="mt-4 text-xl font-semibold">Safety & privacy</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          MediNova-AI is built for educational and hackathon demo purposes. It
          does <strong className="font-medium text-foreground">not</strong>{" "}
          provide medical diagnosis or replace professional care. Always consult
          a qualified healthcare provider for medical decisions. Emergency SOS
          is a simulation unless integrated with real alert providers. OCR and
          barcode results should be verified with a pharmacist or doctor.
        </p>
      </Card>
    </section>
  );
}
