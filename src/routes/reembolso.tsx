import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, SELLER } from "@/components/legal-page";

export const Route = createFileRoute("/reembolso")({
  head: () => ({ meta: [
    { title: "Política de Reembolso — Service Pro OS" },
    { name: "description", content: "Prazo de 14 dias para reembolso das assinaturas do Service Pro OS." },
    { property: "og:title", content: "Política de Reembolso — Service Pro OS" },
    { property: "og:description", content: "Como pedir reembolso da sua assinatura." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Refund,
});

function Refund() {
  return <LegalPage title="Política de Reembolso">
    <p>Oferecemos garantia de satisfação de <b>14 dias</b>. Se você não ficar satisfeito, pode pedir o reembolso integral em até 14 dias da data da compra ou da renovação.</p>
    <h2>Como pedir</h2><p>Os reembolsos são processados pela Paddle, nossa revendedora e Merchant of Record. Acesse <a className="underline" href="https://paddle.net" target="_blank" rel="noreferrer">paddle.net</a> com o e-mail da compra ou fale com nosso suporte em {SELLER.email}.</p>
    <h2>Depois do reembolso</h2><p>A assinatura é encerrada e seus dados continuam disponíveis para consulta e exportação.</p>
    <p>Esta política também segue a <a className="underline" href="https://www.paddle.com/legal/refund-policy" target="_blank" rel="noreferrer">Política de Reembolso da Paddle</a>.</p>
  </LegalPage>;
}
