# Roadmap PontoTech Toledo

## Avisos e documentos pelo WhatsApp
- [ ] Gerar PDF da OS e da garantia para baixar e compartilhar com aviso pelo WhatsApp pessoal
- [ ] Oferecer envio opcional de recebimento e finalização, preservando os status e aprovação de orçamento
- [ ] Validar geração, download e seleção do telefone em sessão autenticada

## Fotos, orçamento e ajustes atuais
- [x] Seleção de garantia com cinco OS recentes e busca por número, nome e CPF
- [x] Persistir fotos privadas e incluí-las nas miniaturas da impressão
- [x] Oferecer formatos A4, térmica 80 mm e 58 mm para OS e garantia
- [x] Implementar orçamento por link com aprovação/recusa registrada
- [x] Fechar menu no celular ao navegar, corrigir margens e simplificar Administração
- [x] Validar gravação de foto, recarga, aprovação pública, leitura no painel e impressão com imagem carregada; impressora física depende do equipamento do cliente

## Listas, numeração e revisão de edição
- [x] Limitar garantias, histórico de vendas e aparelhos em loja a cinco sem filtros
- [x] Pesquisar garantias e aparelhos por número da OS, nome e CPF; vendas por datas
- [x] Vincular automaticamente o número da garantia à OS no banco e na emissão
- [x] Revisar edição de OS, garantias e clientes e validar gravação e recarga autenticadas

## Ajustes de navegação e garantia
- [x] Remover cabeçalhos repetidos e manter boas-vindas somente na Visão geral
- [x] Corrigir corte horizontal da janela de garantia e manter um botão de emissão na aba
- [x] Expandir o menu e voltar ao topo ao selecionar abas ou cartões
- [x] Validar os ajustes no computador e celular

- [x] Ativar dados e acesso seguro
- [x] Criar estrutura visual e navegação responsiva
- [x] Implementar painel operacional
- [x] Implementar ordens, clientes, garantias, estoque e financeiro
- [x] Implementar administração SaaS
- [x] Validar desktop e celular
- [x] Aplicar identidade visual PontoTech Toledo em azul técnico, com Sora e Manrope

## Controles operacionais reais

- [x] Separar cadastros de clientes, estoque, ordens e garantias
- [x] Permitir pesquisar e selecionar clientes por nome ou documento nas ordens
- [x] Implementar movimentações e baixa automática de peças pelo consumo da ordem
- [x] Implementar geração de PDF e impressão para ordens e garantias

## Próximas integrações

- [ ] Configurar entrega de garantias por e-mail
- [ ] Entrega de garantias por e-mail — fora do escopo desta entrega

## Assinaturas (entrega atual)
- [x] Criar página de contratação com os três planos e checkout seguro vinculado à empresa
- [x] Conectar a página de contratação à opção Minha assinatura do painel
- [ ] Retomar validação autenticada do checkout e conferir regras já instaladas
- [ ] Cadastro público na tela inicial e teste único de 3 dias no primeiro acesso
- [ ] Atualizar anual para R$ 299,90 e validar contratação dos três ciclos
- [ ] Configurar três preços e validar periodicidade e tributos
- [ ] Implementar contratação, consulta, portal e troca de ciclo
- [ ] Aplicar confirmação de pagamento, tolerância e proteção de escrita
- [ ] Validar testes, isolamento e telas em computador/celular
- [ ] Validar pagamento completo — depende do checkout externo
- [ ] Habilitar pagamentos reais — depende da ativação da conta no novo provedor

## Migração Paddle → Stripe (entrega atual)
- [x] Criar produto Service Pro OS com preços mensal (R$ 29,90), trimestral (R$ 69,90 a cada 3 meses) e anual (R$ 299,90) em BRL
- [x] Migrar checkout, portal de cobrança e troca de plano do Paddle para Stripe (checkout embutido)
- [x] Reescrever webhook /api/public/payments/webhook para eventos Stripe mantendo process_subscription_payment
- [x] Remover código Paddle (paddle.ts, paddle.server.ts, use-paddle-checkout) e validar build/testes
- [x] Testar compra aprovada em sandbox (cartão 4242): assinatura ativada, período correto, painel liberado, troca de plano mensal→trimestral confirmada
- [ ] Usuário reivindicar/verificar a conta Stripe no painel de pagamentos para liberar cobranças reais
