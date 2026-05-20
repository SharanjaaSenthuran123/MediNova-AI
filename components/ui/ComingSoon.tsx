import Link from "next/link";
import { Construction } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface ComingSoonProps {
  title: string;
  description: string;
  phase: string;
}

export function ComingSoon({ title, description, phase }: ComingSoonProps) {
  return (
    <Card className="mx-auto max-w-xl text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Construction className="h-7 w-7" />
      </span>
      <Badge className="mt-4" variant="outline">
        {phase}
      </Badge>
      <h2 className="mt-4 text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted">{description}</p>
      <Link href="/dashboard" className="mt-6 inline-block">
        <Button variant="outline">Back to Dashboard</Button>
      </Link>
    </Card>
  );
}
