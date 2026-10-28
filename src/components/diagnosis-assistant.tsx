import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateDiagnosis } from "@/utils/diagnosis.functions";

/** Reads the defect fields from the surrounding form and asks the AI for hypotheses and bench tests. */
export function DiagnosisAssistant() {
  const run = useServerFn(generateDiagnosis);
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  async function onClick(e: React.MouseEvent<HTMLButtonElement>) {
    const form = e.currentTarget.closest("form");
    if (!form) return;
    const f = new FormData(form);
    const g = (k: string) => String(f.get(k) || "");
    setBusy(true); setError(""); setText("");
    try {
      const r = await run({ data: { device: [g("category"), g("brand"), g("model")].filter(Boolean).join(" "), reported: g("issue"), observed: g("apparentIssue") } });
      if (r.ok) setText(r.text); else setError(r.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível gerar o diagnóstico.");
    } finally { setBusy(false); }
  }

  return (
    <div className="grid gap-2 rounded-lg border bg-muted/20 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-bold">Assistente de diagnóstico</p>
          <p className="text-xs text-muted-foreground">Gera hipóteses e testes a partir do defeito e dos sintomas acima.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onClick} disabled={busy}>
          <Sparkles className="mr-1 h-4 w-4" />{busy ? "Analisando…" : "Gerar diagnóstico"}
        </Button>
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {text && <div className="whitespace-pre-wrap rounded-md border bg-background p-3 text-sm">{text}<p className="mt-2 text-xs text-muted-foreground">Sugestões automáticas — confirme na bancada antes de orçar.</p></div>}
    </div>
  );
}
