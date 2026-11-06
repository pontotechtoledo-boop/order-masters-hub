import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/auth-page";
import { selectedPlan } from "@/lib/subscriptions";

export const Route = createFileRoute("/")({staticData:{sitemap:true},
  validateSearch: (search: Record<string, unknown>): { plano?: ReturnType<typeof selectedPlan> } => ({ plano: selectedPlan(search["plano"]) }),
  head: () => ({ meta: [
    { title: "Service Pro OS | Login da assistência" },
    { name: "description", content: "Acesse o sistema de gestão da sua assistência técnica." },
    { property: "og:title", content: "Service Pro OS — acesso à assistência" },
    { property: "og:description", content: "Acesse ordens, clientes, estoque e garantias da sua empresa." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: LoginRoute,
});


function LoginRoute() { return <AuthPage plano={Route.useSearch().plano} />; }
