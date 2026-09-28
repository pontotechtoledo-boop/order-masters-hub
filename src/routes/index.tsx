import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => { throw redirect({ to: "/auth" }); },
  head: () => ({ meta: [
    { title: "PontoTech | Gestão de assistência técnica" },
    { name: "description", content: "Gestão de ordens, clientes, estoque e garantias para assistências técnicas." },
    { property: "og:title", content: "PontoTech" },
    { property: "og:description", content: "Gestão completa para assistências técnicas." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => null,
});