import { useQuery } from "@tanstack/react-query";
import { Check, CreditCard, ExternalLink, LoaderCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hotmartCheckoutLinks } from "@/lib/hotmart";
import { formatPlanPrice, hasPaidAccess, isInRenewalGrace, RENEWAL_GRACE_MS, subscriptionPlans } from "@/lib/subscriptions";
import { getBillingOverview } from "@/utils/subscriptions.functions";

export const billingQueryOptions = (organizationId?: string) => ({
  queryKey: ["subscription", organizationId, "hotmart"],
  queryFn: () => getBillingOverview({ data: { organizationId, environment: "live" } }),
});

const date = (value: string | null | undefined) => value ? new Date(value).toLocaleDateString("pt-BR") : "—";

export function SubscriptionPage({ organizationId, embedded = false }: { organizationId?: string; embedded?: boolean }) {
  const { data, error, isPending, refetch, isFetching } = useQuery({ ...billingQueryOptions(organizationId), refetchInterval: 5000 });
  const sub = data?.subscription;
  const paidAccess = hasPaidAccess(sub ?? null);
  const grace = isInRenewalGrace(sub ?? null);
  const currentPlan = subscriptionPlans.find(plan => plan.id === sub?.price_id);
  const graceEnd = grace && sub?.current_period_end ? new Date(Date.parse(sub.current_period_end) + RENEWAL_GRACE_MS).toISOString() : sub?.status === "past_due" && sub.first_failed_at ? new Date(Date.parse(sub.first_failed_at) + RENEWAL_GRACE_MS).toISOString() : null;
  const status = !sub ? "Nenhuma assinatura confirmada" : !paidAccess ? "Renovação necessária" : grace ? "Plano vencido · prazo de tolerância" : ({ active: "Assinatura ativa", trialing: "Assinatura em teste", past_due: "Pagamento pendente", paused: "Assinatura pausada", canceled: "Cancelamento agendado", pending: "Aguardando confirmação" }[sub.status] ?? "Aguardando confirmação");

  return <div className="space-y-6">
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="mb-2 text-xs font-semibold text-primary">Service Pro OS · {data?.organization.name ?? "Sua empresa"}</p>{!embedded && <h1 className="font-display text-2xl font-bold">Minha assinatura</h1>}<p className="mt-2 text-sm text-muted-foreground">Seu plano, vencimento e renovação pela Hotmart.</p></div>
      <Button variant="ghost" size="icon" aria-label="Atualizar assinatura" title="Atualizar assinatura" onClick={() => refetch()} disabled={isFetching}><RefreshCw className={isFetching ? "animate-spin" : ""} /></Button>
    </header>
    {isPending ? <p className="flex items-center gap-2 py-10 text-muted-foreground"><LoaderCircle className="size-4 animate-spin" /> Consultando assinatura…</p> : error ? <div role="alert" className="border-l-4 border-destructive bg-destructive/5 p-4"><p className="text-sm text-destructive">{error.message}</p><Button variant="outline" className="mt-3" onClick={() => refetch()}>Tentar novamente</Button></div> : <>
      <section className="grid gap-5 border-y py-5 sm:grid-cols-3">
        <div><p className="text-xs text-muted-foreground">Situação</p><p className="mt-2 flex items-center gap-2 font-semibold"><ShieldCheck className="size-4 shrink-0 text-primary" />{status}</p></div>
        <div><p className="text-xs text-muted-foreground">Plano atual</p><p className="mt-2 font-semibold">{currentPlan?.name ?? "—"}</p></div>
        <div><p className="text-xs text-muted-foreground">Acesso pago até</p><p className="mt-2 font-semibold">{date(sub?.current_period_end)}</p></div>
      </section>
      {graceEnd && paidAccess && <p role="status" className="border-l-4 border-warning bg-warning-soft p-4 text-sm text-warning">Pagamento pendente. Você pode continuar usando até {date(graceEnd)}. Renove seu plano para evitar o modo somente consulta.</p>}
      {!paidAccess && <p role="alert" className="border-l-4 border-warning bg-warning-soft p-4 text-sm text-warning">{sub ? "Seu plano não permite novos registros. Seus dados continuam disponíveis para consulta e exportação. Renove abaixo para voltar a utilizar todas as funções." : "Escolha um plano. O acesso será liberado após a confirmação do pagamento pela Hotmart."}</p>}
      {sub?.cancel_at_period_end && paidAccess && <p role="status" className="border-l-4 border-primary bg-accent p-4 text-sm">Cancelamento agendado. Seu acesso permanece até {date(sub.current_period_end)}; não haverá renovação automática.</p>}
      <section>
        <div className="mb-4"><h2 className="font-display text-lg font-semibold">{sub ? "Renove seu plano" : "Escolha seu plano"}</h2><p className="mt-1 text-sm text-muted-foreground">Os mesmos recursos em todos os ciclos. Uma assinatura por empresa.</p></div>
        <div className="grid gap-4 md:grid-cols-3">{subscriptionPlans.map(plan => <article key={plan.id} className={`flex flex-col rounded-lg border bg-card p-5 ${plan.id === "pontotech_quarterly" ? "border-primary shadow-brand" : "shadow-card"}`}>
          <div className="flex min-h-7 items-center justify-between gap-2"><h3 className="font-display font-semibold">{plan.name}</h3>{currentPlan?.id === plan.id && <span className="text-xs font-semibold text-primary">Seu plano</span>}</div>
          <p className="mt-5 text-3xl font-bold">{formatPlanPrice(plan.amount)}</p><p className="mt-1 text-sm text-muted-foreground">{plan.period}</p>
          <ul className="my-6 space-y-3 text-sm">{["Ordens de serviço e garantias", "Clientes e equipamentos", "Estoque e financeiro", "Dados da sua empresa"].map(item => <li key={item} className="flex items-center gap-2"><Check className="size-4 shrink-0 text-success" />{item}</li>)}</ul>
          <p className="mb-4 text-xs text-muted-foreground">{plan.renewal} · Tributos incluídos</p>
          {data?.canManage && <Button asChild className="mt-auto w-full" variant={plan.id === "pontotech_quarterly" ? "default" : "outline"}><a href={hotmartCheckoutLinks[plan.id]} target="_blank" rel="noopener noreferrer"><CreditCard />{sub ? "Renovar" : "Assinar"} {plan.name.toLowerCase()}<ExternalLink className="size-3 shrink-0" /></a></Button>}
        </article>)}</div>
      </section>
      {!data?.canManage && <p className="text-sm text-muted-foreground">A contratação e a gestão ficam disponíveis para o proprietário ou administrador da empresa.</p>}
      <footer className="flex flex-wrap items-start gap-2 border-t pt-5 text-xs leading-5 text-muted-foreground"><ShieldCheck className="mt-0.5 size-4 shrink-0" /><p>Pagamento seguro pela Hotmart. Use o mesmo e-mail da sua conta na compra para manter seu acesso e seus dados.<br />A renovação automática e o cancelamento são gerenciados na Hotmart. Pagamentos aprovados atualizam esta assinatura, sem gerar outra senha.<br /><a className="underline" href="/termos">Termos</a> · <a className="underline" href="/privacidade">Privacidade</a> · <a className="underline" href="/reembolso">Reembolso</a></p></footer>
    </>}
  </div>;
}
