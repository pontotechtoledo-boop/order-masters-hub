import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, SELLER } from "@/components/legal-page";

export const Route = createFileRoute("/termos")({
  head: () => ({ meta: [
    { title: "Termos de Uso — Service Pro OS" },
    { name: "description", content: "Termos de uso do sistema Service Pro OS para assistências técnicas." },
    { property: "og:title", content: "Termos de Uso — Service Pro OS" },
    { property: "og:description", content: "Condições para uso do sistema de ordens de serviço e garantias." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Terms,
});

function Terms() {
  return <LegalPage title="Termos de Uso">
    <p>Estes termos regem o uso do sistema {SELLER.tradeName}, fornecido por <b>{SELLER.legalName}</b>, inscrita sob {SELLER.document}, com endereço em {SELLER.address} ("nós"). Ao contratar ou utilizar o serviço, você firma contrato conosco.</p>
    <h2>1. Aceitação</h2><p>Ao criar uma conta ou continuar utilizando o serviço, você concorda com estes termos. Quem contrata em nome de uma empresa declara ter poderes para representá-la e ser maior de idade.</p>
    <h2>2. O serviço</h2><p>Sistema online para assistências técnicas: ordens de serviço, garantias, clientes, estoque e financeiro. Cada empresa recebe um teste grátis único de 3 dias. Depois, o uso exige assinatura mensal, trimestral ou anual, com renovação automática.</p>
    <h2>3. Conta e dados</h2><p>Você é responsável por manter suas credenciais em sigilo, pelas atividades realizadas na sua conta e pela veracidade das informações cadastradas.</p>
    <h2>4. Uso proibido</h2><ul><li>uso ilegal ou para fraude, spam ou golpes;</li><li>violação de propriedade intelectual de terceiros;</li><li>interferência na segurança, como malware, testes de invasão, raspagem de dados ou contorno de limites técnicos;</li><li>engenharia reversa, revenda ou redistribuição do sistema.</li></ul>
    <h2>5. Propriedade intelectual</h2><p>O software, a documentação e a marca pertencem a {SELLER.legalName}. Concedemos licença limitada, não exclusiva e intransferível de uso durante a assinatura. Os dados que você cadastra continuam sendo seus; nós apenas os armazenamos e processamos para prestar o serviço.</p>
    <h2>6. Pagamentos e assinaturas</h2><p>As cobranças são processadas com segurança pelo Stripe. O responsável pela venda é {SELLER.legalName} ({SELLER.document}). A renovação é automática e o cancelamento pode ser feito a qualquer momento na gestão da assinatura: o acesso permanece até o fim do período pago. A troca de plano passa a valer na renovação seguinte. Reembolsos seguem a nossa <a className="underline" href="/reembolso">Política de Reembolso</a>.</p>
    <h2>7. Nível de serviço</h2><p>Trabalhamos para manter o sistema disponível, mas não garantimos funcionamento ininterrupto ou livre de erros. Na máxima extensão permitida por lei, não oferecemos garantias implícitas.</p>
    <h2>8. Suspensão e encerramento</h2><p>Podemos suspender ou encerrar o acesso em caso de violação relevante destes termos, falta de pagamento, risco de segurança ou fraude, ou violações repetidas. Se a assinatura vencer, os dados ficam disponíveis para consulta e exportação, mas novas alterações ficam bloqueadas até o pagamento.</p>
    <h2>9. Responsabilidade</h2><p>Nossa responsabilidade total fica limitada ao valor pago nos últimos 12 meses e não abrange danos indiretos, como lucros cessantes ou perda de dados, exceto quando a lei exigir.</p>
    <h2>10. Lei aplicável</h2><p>Estes termos seguem a legislação brasileira, inclusive o Código de Defesa do Consumidor quando aplicável. Contato: {SELLER.email}.</p>
  </LegalPage>;
}
