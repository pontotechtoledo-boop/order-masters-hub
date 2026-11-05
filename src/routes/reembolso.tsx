import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, SELLER } from "@/components/legal-page";

export const Route = createFileRoute("/reembolso")({
  head: () => ({ meta: [
    { title: "Política de Reembolso — Service Pro OS" },
    { name: "description", content: "Prazo de 7 dias para reembolso das assinaturas do Service Pro OS." },
    { property: "og:title", content: "Política de Reembolso — Service Pro OS" },
    { property: "og:description", content: "Como pedir reembolso da sua assinatura." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Refund,
});

function Refund() {
  return <LegalPage title="Política de Reembolso">
    <p>O Service Pro OS oferece garantia de satisfação de <b>7 dias corridos</b>. Se você não ficar satisfeito, pode pedir o reembolso integral em até 7 dias da data da compra ou da renovação. Esta garantia é oferecida por PontoTech Toledo, não pelo Stripe. O Stripe processa o pagamento e a devolução; não define um prazo próprio de satisfação para nosso produto.</p>
    <h2>Como pedir</h2><p>Fale com nosso suporte em {SELLER.email} informando o e-mail da compra. O valor é devolvido pelo mesmo meio de pagamento, conforme os prazos do Stripe e da operadora.</p>
    <h2>Depois do reembolso</h2><p>A assinatura é encerrada e seus dados continuam disponíveis para consulta e exportação.</p>
  </LegalPage>;
}
