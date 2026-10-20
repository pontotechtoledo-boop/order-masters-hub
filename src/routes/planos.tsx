import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing-page";

export const Route = createFileRoute("/planos")({
  head: () => ({ meta: [
    { title: "Service Pro OS | Gestão completa para assistência técnica" },
    { name: "description", content: "Organize ordens de serviço, clientes, estoque, garantias e financeiro em um só lugar. Experimente o Service Pro OS grátis por 3 dias." },
    { property: "og:title", content: "Service Pro OS" },
    { property: "og:description", content: "Menos improviso, mais controle para sua assistência técnica. Comece com 3 dias grátis." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: LandingPage,
});

