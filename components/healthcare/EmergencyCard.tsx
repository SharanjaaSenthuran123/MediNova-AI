import { Mail, Phone, User } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { EmergencyContact } from "@/types/emergency";

interface EmergencyCardProps {
  contact: EmergencyContact;
}

export function EmergencyCard({ contact }: EmergencyCardProps) {
  return (
    <Card className="flex items-start gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-danger/10 text-danger">
        <User className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{contact.name}</p>
        <p className="text-sm text-muted">{contact.relation}</p>
        <div className="mt-2 space-y-1 text-sm">
          <p className="flex items-center gap-2 text-muted">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            {contact.phone}
          </p>
          {contact.email && (
            <p className="flex items-center gap-2 text-muted">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              {contact.email}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
