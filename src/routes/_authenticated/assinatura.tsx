import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubscriptionPage, billingQueryOptions } from "@/components/subscription-page";

export const Route = createFileRoute("/_authenticated/assinatura")({
  head: () => ({ meta: [
    { title: "Minha assinatura | PontoTech Toledo" },
    { name: "description", content: "Contrate e gerencie sua assinatura PontoTech Toledo: mensal, trimestral ou anual." },
    { property: "og:title", content: "Assinatura PontoTech Toledo" },
    { property: "og:description", content: "Escolha o plano da sua assistência técnica e acompanhe suas cobranças." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(billingQueryOptions()),
  component: Page,
});
function Page() {
  return <main className="min-h-screen bg-background px-4 py-6 sm:px-8"><div className="mx-auto max-w-5xl"><nav className="mb-8 flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-2 font-display font-semibold"><Wrench className="size-5 text-primary" />PontoTech Toledo</div><Button variant="outline" asChild><Link to="/dashboard"><ArrowLeft />Voltar ao painel</Link></Button></nav><SubscriptionPage /></div></main>;
}