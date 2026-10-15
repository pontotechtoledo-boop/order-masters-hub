import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "PontoTech Toledo | Acesso ao sistema" },
    { name: "description", content: "Acesse sua assistência técnica para gerenciar ordens, garantias e finanças." },
    { property: "og:title", content: "PontoTech Toledo | Acesso ao sistema" },
    { property: "og:description", content: "Entre no sistema da sua assistência e acompanhe a operação da empresa." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (!error && data.user) {
      throw redirect({ to: "/dashboard", replace: true });
    }
    throw redirect({ to: "/auth", replace: true });
  },
});
