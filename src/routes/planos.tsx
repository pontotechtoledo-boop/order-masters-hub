import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing-page";

export const Route = createFileRoute("/planos")({
  head: () => ({ meta: [
    { title: "Service Pro OS | Gestão completa para assistência técnica" },
    { name: "description", content: "Organize ordens de serviço, clientes, estoque, garantias e financeiro em um só lugar. Assine e tenha 7 dias de garantia." },
    { property: "og:title", content: "Service Pro OS" },
    { property: "og:description", content: "Menos improviso, mais controle para sua assistência técnica. Garantia de 7 dias." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: LandingPage,
});

