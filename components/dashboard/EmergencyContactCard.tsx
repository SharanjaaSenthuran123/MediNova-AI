import Link from "next/link";
import { Phone, Siren } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { emergencyContacts } from "@/data/dashboardStats";

export function EmergencyContactCard() {
  return (
    <Card className="mb-6 border-secondary/20">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <section className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
            <Siren className="h-5 w-5" />
          </span>
          <section>
            <h3 className="font-semibold">Emergency contacts</h3>
            <p className="text-sm text-muted">
              {emergencyContacts.length} contacts on file for SOS simulation
            </p>
          </section>
        </section>
        <Link href="/emergency">
          <Button size="sm" variant="outline">
            Open SOS
          </Button>
        </Link>
      </section>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {emergencyContacts.map((contact) => (
          <li
            key={contact.phone}
            className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
          >
            <section>
              <p className="font-medium">{contact.name}</p>
              <p className="text-sm text-muted">{contact.relation}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                <Phone className="h-3 w-3" />
                {contact.phone}
              </p>
            </section>
            <Badge variant={contact.status === "active" ? "success" : "warning"}>
              {contact.status === "active" ? "Active" : "Pending"}
            </Badge>
          </li>
        ))}
      </ul>
    </Card>
  );
}
