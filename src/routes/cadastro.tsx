import { createFileRoute, redirect } from "@tanstack/react-router";

// O acesso agora é criado automaticamente após a compra na Hotmart.
export const Route = createFileRoute("/cadastro")({
  beforeLoad: () => { throw redirect({ to: "/planos" }); },
});
