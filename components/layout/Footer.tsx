import Link from "next/link";
import { Activity } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="relative border-t border-white/20 glass dark:border-white/10">
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <section>
            <Link href="/" className="group flex items-center gap-2 font-semibold">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow transition-transform duration-300 group-hover:scale-105">
                <Activity className="h-5 w-5" />
              </span>
              {APP_NAME}
            </Link>
            <p className="mt-3 max-w-sm text-sm text-muted">
              AI-powered smart healthcare ecosystem for symptom guidance,
              prescription reading, medicine verification, and emergency-ready
              demos.
            </p>
          </section>

          <section className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <section>
              <h4 className="text-sm font-semibold">Product</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                <li>
                  <Link href="/#features" className="transition-colors hover:text-primary">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/#how-it-works" className="transition-colors hover:text-primary">
                    How it works
                  </Link>
                </li>
                <li>
                  <Link href="/#roadmap" className="transition-colors hover:text-primary">
                    Roadmap
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="transition-colors hover:text-primary">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/symptom-checker" className="transition-colors hover:text-primary">
                    Symptom Checker
                  </Link>
                </li>
                <li>
                  <Link href="/emergency" className="transition-colors hover:text-primary">
                    Emergency SOS
                  </Link>
                </li>
              </ul>
            </section>
            <section>
              <h4 className="text-sm font-semibold">Tools</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                <li>
                  <Link
                    href="/prescription-reader"
                    className="transition-colors hover:text-primary"
                  >
                    Prescription OCR
                  </Link>
                </li>
                <li>
                  <Link href="/barcode-scanner" className="transition-colors hover:text-primary">
                    Smart Medicine Scanner
                  </Link>
                </li>
                <li>
                  <Link href="/reports" className="transition-colors hover:text-primary">
                    Reports
                  </Link>
                </li>
              </ul>
            </section>
            <section>
              <h4 className="text-sm font-semibold">Safety</h4>
              <p className="mt-3 text-sm text-muted">
                Demo/educational use only. Not a medical diagnosis. Always
                consult a qualified healthcare professional.
              </p>
            </section>
          </section>
        </section>

        <p className="mt-8 border-t border-white/20 pt-6 text-center text-sm text-muted dark:border-white/10">
          © {new Date().getFullYear()} {APP_NAME}. Built for hackathon demo.
        </p>
      </section>
    </footer>
  );
}
