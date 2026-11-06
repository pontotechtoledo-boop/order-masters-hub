import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, SELLER } from "@/components/legal-page";
import { Button } from '@/components/ui/button';
import { refuseAdsMeasurement } from '@/lib/ads-measurement-browser';

export const Route = createFileRoute("/privacidade")({staticData:{sitemap:true},
  head: () => ({ meta: [
    { title: "Política de Privacidade — Service Pro OS" },
    { name: "description", content: "Como o Service Pro OS coleta, usa e protege dados pessoais." },
    { property: "og:title", content: "Política de Privacidade — Service Pro OS" },
    { property: "og:description", content: "Tratamento de dados pessoais conforme a LGPD." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Privacy,
});

function Privacy() {
  return <LegalPage title="Política de Privacidade">
    <p><b>{SELLER.legalName}</b> ({SELLER.tradeName}), inscrita sob {SELLER.document}, é a controladora dos dados pessoais da conta e do uso do sistema, conforme a Lei Geral de Proteção de Dados (LGPD). Para os dados de clientes que a sua assistência cadastra no sistema, nós atuamos como operadora, seguindo suas instruções.</p>
    <h2>Dados coletados e finalidades</h2><ul>
      <li><b>Cadastro e contratação</b> (nome, e-mail, CPF ou CNPJ, dados da assistência e senha protegida): identificar o responsável, vincular a assinatura e criar e manter a conta. Na compra antes da senha, os dados da contratação são guardados para concluir o cadastro por link seguro enviado ao e-mail. Base legal: execução de contrato.</li>
      <li><b>Dados inseridos no sistema</b> (clientes, aparelhos, fotos, ordens, garantias, estoque, financeiro): prestar o serviço. Base legal: execução de contrato.</li>
      <li><b>Uso e dispositivo</b> (endereço IP, navegador, registros de acesso): segurança, prevenção a fraudes e melhoria do produto. Base legal: legítimo interesse.</li>
      <li><b>Mensagens de suporte</b>: atendimento. Base legal: execução de contrato e legítimo interesse.</li>
    </ul>
    <h2>Compartilhamento</h2><ul>
      <li>Prestadores de serviço de hospedagem, banco de dados e e-mail;</li>
      <li>Stripe, para processamento de pagamentos, gestão de assinaturas, cobranças e faturas;</li>
      <li>Google Ads, para medir assinaturas pagas e orientar os anúncios: informações do navegador/dispositivo, identificadores de publicidade e identificador, valor e moeda do pagamento. Não enviamos nome, e-mail, CPF/CNPJ, fotos ou dados dos clientes da assistência para essa medição;</li>
      <li>Assessores profissionais (contábil e jurídico);</li>
      <li>Autoridades, quando a lei exigir.</li>
    </ul>
    <p>Alguns prestadores podem armazenar dados fora do Brasil, com salvaguardas contratuais adequadas.</p>
    <h2>Retenção</h2><p>Mantemos os dados enquanto a conta estiver ativa e pelo prazo exigido por obrigações legais. Depois disso, eles são excluídos ou anonimizados.</p>
    <h2>Seus direitos</h2><p>Você pode pedir confirmação, acesso, correção, anonimização, portabilidade ou exclusão dos dados, informações sobre compartilhamento e revogação do consentimento, além de reclamar à ANPD. Para isso, escreva para {SELLER.email}.</p>
    <h2>Segurança</h2><p>Usamos criptografia em trânsito, controle de acesso por empresa, armazenamento privado de fotos e logotipos e registros de acesso.</p>
    <h2>Cookies e publicidade</h2><p>Usamos armazenamento essencial para manter sua sessão conectada e, nas regiões permitidas, Google Ads para medir assinaturas pagas e otimizar anúncios. Sem aviso de consentimento, não carregamos a medição nas regiões que exigem autorização nem quando a localização não puder ser confirmada. A localização por país não distingue Quebec; por isso, a medição fica desativada em todo o Canadá. Respeitamos recusas e o sinal Global Privacy Control. Não usamos correspondência de dados pessoais. Consulte também a <a href="https://business.safety.google/privacy/" className="underline" rel="noopener noreferrer" target="_blank">privacidade do Google</a>.</p><p>Você pode desativar a medição neste navegador a qualquer momento. A escolha permanece salva e é aplicada também às outras abas abertas; não interfere na assinatura ou no acesso ao sistema.</p><Button variant="outline" onClick={() => { refuseAdsMeasurement(); window.alert('Medição de publicidade desativada neste navegador.'); }}>Desativar medição de publicidade</Button>
  </LegalPage>;
}
