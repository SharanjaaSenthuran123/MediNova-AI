"use client";

import { useState } from "react";
import { Brain, AlertTriangle, Search } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface PharmacyAIRecommendationsProps {
  onRecommend: (symptoms: string) => Promise<{
    medicines: { name: string; reason: string; genericAlternative?: string }[];
    warnings: string[];
    disclaimer: string;
    availableInCatalog: { id: string; name: string; price: number; stock: number }[];
  }>;
  onCheckInteractions: (names: string[]) => Promise<{
    warnings: { pair: string; severity: string; message: string }[];
    safe: boolean;
  }>;
  cartMedicineNames: string[];
  onAddCatalogId: (id: string, name: string) => void;
}

export function PharmacyAIRecommendations({
  onRecommend,
  onCheckInteractions,
  cartMedicineNames,
  onAddCatalogId,
}: PharmacyAIRecommendationsProps) {
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof onRecommend>> | null>(null);
  const [interactions, setInteractions] = useState<
    Awaited<ReturnType<typeof onCheckInteractions>> | null
  >(null);

  const runRecommend = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    try {
      const data = await onRecommend(symptoms.trim());
      setResult(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "AI recommendation failed");
    } finally {
      setLoading(false);
    }
  };

  const runInteractions = async () => {
    if (cartMedicineNames.length < 2) {
      toast.message("Add at least 2 medicines to check interactions");
      return;
    }
    setLoading(true);
    try {
      const data = await onCheckInteractions(cartMedicineNames);
      setInteractions(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Interaction check failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass p-4">
      <h3 className="mb-3 flex items-center gap-2 font-semibold">
        <Brain className="h-5 w-5 text-primary" />
        AI Pharmacy Assistant
      </h3>

      <div className="flex gap-2">
        <Input
          placeholder="Describe symptoms (e.g. headache, fever)"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void runRecommend()}
        />
        <Button onClick={() => void runRecommend()} disabled={loading}>
          {loading ? <LoadingSpinner size="sm" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      {result && (
        <div className="mt-4 space-y-2 text-sm">
          {result.medicines.map((m, i) => (
            <div key={i} className="rounded-lg bg-white/5 p-2">
              <p className="font-medium">{m.name}</p>
              <p className="text-xs text-muted">{m.reason}</p>
              {m.genericAlternative && (
                <p className="text-xs text-secondary">Alt: {m.genericAlternative}</p>
              )}
            </div>
          ))}
          {result.availableInCatalog.length > 0 && (
            <div className="mt-2">
              <p className="mb-1 text-xs font-medium text-muted">Available now:</p>
              <div className="flex flex-wrap gap-1">
                {result.availableInCatalog.map((m) => (
                  <Button
                    key={m.id}
                    size="sm"
                    variant="outline"
                    onClick={() => onAddCatalogId(m.id, m.name)}
                  >
                    {m.name} · ${m.price.toFixed(2)}
                  </Button>
                ))}
              </div>
            </div>
          )}
          {result.warnings?.map((w, i) => (
            <p key={i} className="flex items-start gap-1 text-xs text-amber-600">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {w}
            </p>
          ))}
          <p className="text-[11px] text-muted">{result.disclaimer}</p>
        </div>
      )}

      {cartMedicineNames.length >= 2 && (
        <Button variant="outline" size="sm" className="mt-3" onClick={() => void runInteractions()}>
          Check cart drug interactions
        </Button>
      )}

      {interactions && (
        <div className="mt-3 space-y-1">
          {interactions.safe && interactions.warnings.length === 0 ? (
            <Badge variant="success">No known interactions</Badge>
          ) : (
            interactions.warnings.map((w, i) => (
              <p key={i} className="text-xs text-amber-600">
                [{w.severity}] {w.pair}: {w.message}
              </p>
            ))
          )}
        </div>
      )}
    </Card>
  );
}
