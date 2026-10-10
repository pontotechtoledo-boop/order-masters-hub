import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, CreditCard, ExternalLink, LoaderCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PaymentTestModeBanner } from "@/components/payment-test-mode-banner";
import { usePaddleCheckout } from "@/hooks/use-paddle-checkout";
import { getPaddleEnvironment } from "@/lib/paddle";
import { formatPlanPrice, subscriptionPlans, type PlanId } from "@/lib/subscriptions";
import { createBillingPortal, getBillingOverview } from "@/utils/subscriptions.functions";

export const billingQueryOptions = (organizationId?: string) => ({
  queryKey: ["subscription", organizationId, getPaddleEnvironment()],
  queryFn: () => getBillingOverview({ data: { organizationId, environment: getPaddleEnvironment() } }),
});

const date = (value: string | null | undefined) => value ? new Date(value).toLocaleDateString("pt-BR") : "—";

export function SubscriptionPage({ organizationId }: { organizationId?: string }) {
  const { data, error, isPending, refetch, isFetching } = useQuery({ ...billingQueryOptions(organizationId), refetchInterval: 5000 });
  const { openCheckout, loading } = usePaddleCheckout();
  const portal = useServerFn(createBillingPortal);
  const [actionError, setActionError] = useState("");
  const [selected, setSelected] = useState<PlanId | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const sub = data?.subscription;
  const trialDays = data?.organization.trial_ends_at ? Math.max(0, Math.ceil((Date.parse(data.organization.trial_ends_at) - Date.now()) / 86400000)) : 0;
  const existing = Boolean(sub && (["active", "trialing", "past_due", "paused", "pending"].includes(sub.status) || data?.paidAccess));
  const currentPlan = subscriptionPlans.find(plan => plan.id === sub?.price_id);
  const status = sub ? ({ active: "Assinatura ativa", trialing: "Assinatura em teste", past_due: "Pagamento pendente", paused: "Assinatura pausada", canceled: data?.paidAccess ? "Cancelamento agendado" : "Assinatura encerrada", pending: "Aguardando confirmação" }[sub.status] ?? "Aguardando confirmação") : data?.trialActive ? "Teste grátis em andamento" : "Teste grátis encerrado";
  const buy = async (id: PlanId) => {
    if (!data) return;
    setActionError(""); setSelected(id);
    try { await openCheckout(data.organization.id, id); }
    catch (error) { setActionError(error instanceof Error ? error.message : "Não foi possível abrir o pagamento."); }
  };
  const manage = async () => {
    if (!data) return;
    setPortalLoading(true); setActionError("");
    const tab = window.open("about:blank", "_blank");
    if (tab) tab.opener = null;
    try { const { url } = await portal({ data: { organizationId: data.organization.id, environment: getPaddleEnvironment() } }); if (tab) tab.location.href = url; else window.location.assign(url); }
    catch (error) { tab?.close(); setActionError(error instanceof Error ? error.message : "Não foi possível abrir a gestão da assinatura."); }
    finally { setPortalLoading(false); }
  };
  return <div className="space-y-6">
    <PaymentTestModeBanner />
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="mb-2 text-xs font-semibold text-primary">PontoTech Toledo · {data?.organization.name ?? "Sua empresa"}</p><h1 className="font-display text-2xl font-bold">Minha assinatura</h1><p className="mt-2 text-sm text-muted-foreground">{existing ? "Seu plano, vencimento e cobranças." : "Escolha o ciclo para continuar com sua assistência."}</p></div>
      <Button variant="ghost" size="icon" aria-label="Atualizar assinatura" title="Atualizar assinatura" onClick={() => refetch()} disabled={isFetching}><RefreshCw className={isFetching ? "animate-spin" : ""} /></Button>
    </header>
    {isPending ? <p className="flex items-center gap-2 py-10 text-muted-foreground"><LoaderCircle className="size-4 animate-spin" /> Consultando assinatura…</p> : error ? <div role="alert" className="border-l-4 border-destructive bg-destructive/5 p-4"><p className="text-sm text-destructive">{error.message}</p><Button variant="outline" className="mt-3" onClick={() => refetch()}>Tentar novamente</Button></div> : <>
      <section className="grid gap-5 border-y py-5 sm:grid-cols-3">
        <div><p className="text-xs text-muted-foreground">Situação</p><p className="mt-2 flex items-center gap-2 font-semibold"><ShieldCheck className="size-4 text-primary" />{status}</p></div>
        <div><p className="text-xs text-muted-foreground">Plano atual</p><p className="mt-2 font-semibold">{currentPlan?.name ?? "Teste grátis de 3 dias"}</p></div>
        <div><p className="text-xs text-muted-foreground">{sub ? "Fim do período / próxima cobrança" : "Fim do teste grátis"}</p><p className="mt-2 font-semibold">{date(sub?.current_period_end ?? data?.organization.trial_ends_at)}</p></div>
      </section>
      {!existing && <p role="status" className="border-l-4 border-primary bg-accent p-4 text-sm">{data?.trialActive ? `Seu teste termina em ${date(data.organization.trial_ends_at)} (${trialDays} ${trialDays === 1 ? "dia restante" : "dias restantes"}). A cobrança do plano escolhido começa ao contratar.` : "Seu teste grátis terminou. Escolha um plano para continuar."}</p>}
      {sub?.status === "pending" && <p role="status" className="bg-warning-soft p-4 text-sm text-warning">Aguardando a confirmação oficial do pagamento. A situação será atualizada automaticamente.</p>}
      {sub?.status === "past_due" && <p role="status" className="bg-warning-soft p-4 text-sm text-warning">Regularize seu pagamento na gestão da assinatura.{sub.first_failed_at && ` Prazo de tolerância: ${date(new Date(Date.parse(sub.first_failed_at) + 7 * 86400000).toISOString())}.`}</p>}
      <section>
        <div className="mb-4"><h2 className="font-display text-lg font-semibold">{existing ? "Ciclos disponíveis" : "Escolha seu plano"}</h2><p className="mt-1 text-sm text-muted-foreground">Os mesmos recursos em todos os ciclos. Uma assinatura por empresa.</p></div>
        <div className="grid gap-4 md:grid-cols-3">{subscriptionPlans.map(plan => <article key={plan.id} className={`flex flex-col rounded-lg border bg-card p-5 ${plan.id === "pontotech_quarterly" ? "border-primary shadow-brand" : "shadow-card"}`}>
          <div className="flex min-h-7 items-center justify-between gap-2"><h3 className="font-display font-semibold">{plan.name}</h3>{currentPlan?.id === plan.id && <span className="text-xs font-semibold text-primary">Seu plano</span>}</div>
          <p className="mt-5 text-3xl font-bold">{formatPlanPrice(plan.amount)}</p><p className="mt-1 text-sm text-muted-foreground">{plan.period}</p>
          <ul className="my-6 space-y-3 text-sm">{["Ordens de serviço e garantias", "Clientes e equipamentos", "Estoque e financeiro", "Dados da sua empresa"].map(item => <li key={item} className="flex items-center gap-2"><Check className="size-4 shrink-0 text-success" />{item}</li>)}</ul>
          <p className="mb-4 text-xs text-muted-foreground">{plan.renewal} · Tributos incluídos</p>
          {!existing && <Button className="mt-auto w-full" variant={plan.id === "pontotech_quarterly" ? "default" : "outline"} disabled={loading || !data?.canManage} onClick={() => buy(plan.id)}>{loading && selected === plan.id ? <><LoaderCircle className="animate-spin" />Preparando…</> : <><CreditCard />Contratar {plan.name.toLowerCase()}</>}</Button>}
        </article>)}</div>
      </section>
      {existing && data?.canManage && <Button onClick={manage} disabled={portalLoading}><ExternalLink />{portalLoading ? "Abrindo…" : "Gerenciar assinatura e cobranças"}</Button>}
      {!data?.canManage && <p className="text-sm text-muted-foreground">A contratação e a gestão ficam disponíveis para o proprietário ou administrador da empresa.</p>}
      {actionError && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{actionError}</p>}
      <footer className="flex flex-wrap items-start gap-2 border-t pt-5 text-xs leading-5 text-muted-foreground"><ShieldCheck className="mt-0.5 size-4 shrink-0" /><p>Pagamento seguro pelo Paddle. As formas disponíveis aparecem no pagamento.<br />Renovação automática. Ao cancelar, seu acesso permanece até o fim do período pago.</p></footer>
    </>}
  </div>;
}