import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing-page";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Service Pro OS | Sistema para assistência técnica" },
    { name: "description", content: "Ordens de serviço, garantias, estoque e financeiro para assistências técnicas. Planos a partir de R$ 29,90/mês com 3 dias grátis." },
    { property: "og:title", content: "Service Pro OS | Sistema para assistência técnica" },
    { property: "og:description", content: "Gestão completa para assistência técnica. Comece com 3 dias grátis." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: LandingPage,
});
