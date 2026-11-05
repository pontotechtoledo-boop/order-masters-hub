# Roadmap PontoTech Toledo

## Liberação automática Stripe real
- [ ] Confirmar webhook live, vínculo servidor-conta e atualização automática das abas; validar processamento e apontar pendência de publicação/pagamento real

## Prints para vídeo de divulgação
- [x] Capturar páginas funcionais do sistema sem dados pessoais e entregar imagens organizadas — 16 PNGs e ZIP; assistência demonstrativa vazia, liberação apenas simulada no navegador para captura

## Página de venda e compra antes da senha
- [ ] Criar seção “Acesse e conheça” com prévia pública sem e-mail, abas bloqueadas e botão de assinatura Stripe
- [ ] Reforçar azuis e urgência honesta no início da landing, com identidade própria
- [ ] Adicionar compra Stripe antes da senha com vínculo seguro e conclusão por e-mail
- [ ] Preservar prévia bloqueada e contratação autenticada existentes
- [ ] Auditar publicação, três planos, pagamento, renovação e entrega de e-mail — três preços live confirmados, 34 testes e build OK; envios registrados, sem prova de recebimento; compra pública ainda requer revisão de segurança dos tokens e continuidade, publicação e validação live

## Cadastro e identidade da assistência
- [x] Remover nome de empresa imposto por e-mail e conferir cadastro atual
- [x] Exigir CPF/CNPJ válido e guardar no cadastro da assistência
- [x] Confirmar e-mail único e mostrar retorno claro para cadastro repetido
- [x] Tornar orientação de senha intuitiva, mantendo proteção contra vazamentos
- [x] Validar regras e telas — 30 testes, 9 regras no banco, cadastro repetido bloqueado e nome PontoTech confirmado no painel

## Prévia antes da assinatura e textos de acesso
- [x] Simplificar e-mail no login e textos de cadastro/confirmação, mantendo requisitos de senha e proteção contra senhas vazadas
- [x] Mostrar o menu e visão prévia sem permitir operações para contas sem assinatura, com contratação Stripe em janela
- [x] Oferecer conhecer o sistema e escolher plano na landing, mantendo compra vinculada à conta confirmada
- [x] Conferir três preços live e eventos de reembolso, testar telas e fluxo de contratação

## Revisão de acesso e garantia Stripe
- [x] Destacar garantia própria de reembolso de 7 dias, sem atribuí-la ao Stripe
- [x] Impedir uso sem assinatura paga e remover fallback de trial antigo no banco e na consulta de assinatura
- [x] Corrigir confirmação paga entregue fora de ordem; preservar renovação durante/depois da tolerância e validar preço/ciclo na troca agendada
- [x] Validar 18 testes, 7 regras de banco e páginas em computador/celular sem erros
- [ ] Validar troca trimestral/anual efetiva e primeira renovação live — depende da publicação e de pagamento/renovação real; aplicativo instalado, chaves e três planos live confirmados; troca de ciclo continua agendada para próxima renovação

## Retorno ao Stripe
- [x] Restaurar contratação embutida, cadastro sem teste grátis e gestão da assinatura
- [x] Remover integração ativa Hotmart preservando registros e períodos pagos
- [x] Processar confirmação, renovação, falha e reembolso Stripe com segurança e e-mail
- [x] Validar compra mensal de teste aprovada, período até 05/12/2026 e replay seguro do evento invoice.paid
- [x] Confirmar domínio de envio verificado e telas no computador/celular sem erros
- [ ] Liberar produção — depende somente da publicação; aplicativo e chaves live confirmados, três preços ativos e eventos de reembolso/contestação adicionados
- [ ] Confirmar entrega na caixa de entrada e primeira cobrança live — depende da publicação e da liberação Stripe

## E-mails de compra e renovação Hotmart
- [x] Preparar envio de e-mail com link https://serviceproos.app/auth após confirmação de compra ou renovação
- [x] Preservar convite para criar senha no primeiro acesso e senha existente nas renovações
- [x] Validar confirmação e proteção contra duplicação — seis testes aprovados
- [ ] Confirmar entrega real — depende da verificação DNS de notify.serviceproos.app e publicação

## Renovação real Hotmart não reconhecida
- [x] Confirmar recebimento de compra aprovada e diagnóstico `unknown_plan`
- [x] Corrigir identificação por oferta Hotmart e validar os três planos; 20 testes aprovados e build automático OK
- [x] Liberar reenvio somente do evento aprovado que falhou, sem alterar a validade manualmente
- [ ] Reprocessar compra real — depende de publicação e reenvio pela Hotmart; payload original não disponível para replay seguro
- [x] Corrigir bloqueio pelo trial expirado: escrita passa a consultar a assinatura live e respeitar os sete dias de tolerância
- [x] Validar na sessão de Cristiano acesso de escrita autorizado, painel disponível e seis testes determinísticos no banco; aviso persiste porque a compra real ainda não atualizou a validade

## Login por e-mail e assinatura Hotmart
- [x] Alterar login para e-mail e manter recuperação de senha
- [x] Mostrar os três links Hotmart na assinatura interna com situação e vencimento
- [x] Validar formato do e-mail, recuperação sem e-mail, assinatura autenticada e tela de contratação no painel; 14 testes aprovados e build automático OK

## Informações comerciais e identidade do site
- [x] Detalhar benefícios reais e recursos incluídos nos três planos sem mudar o design
- [x] Renomear o título interno de Plataforma para Assinaturas/Administração
- [x] Substituir o favicon por uma chave técnica e validar páginas e navegação

## Avisos e documentos pelo WhatsApp
- [x] Gerar PDF da OS e da garantia para baixar e compartilhar com aviso pelo WhatsApp pessoal
- [x] Oferecer envio opcional de recebimento e finalização, preservando os status e aprovação de orçamento
- [x] Validar geração, download e seleção do telefone em sessão autenticada; confirmação do envio e compartilhamento nativo dependem do WhatsApp/dispositivo do usuário

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

## Fluxo da OS e vitrine na landing (entrega atual)
- [x] Transformar "Nova ordem" em fluxo de 3 passos: Cliente → Aparelho e defeito → Peças, valores e conclusão
- [x] Capturar telas reais (visão geral, nova OS, garantia) e criar seção "Por dentro do sistema" na landing
- [x] Validar build, testes e navegação no computador e celular

## Migração Paddle → Stripe (entrega atual)
- [x] Criar produto Service Pro OS com preços mensal (R$ 29,90), trimestral (R$ 69,90 a cada 3 meses) e anual (R$ 299,90) em BRL
- [x] Migrar checkout, portal de cobrança e troca de plano do Paddle para Stripe (checkout embutido)
- [x] Reescrever webhook /api/public/payments/webhook para eventos Stripe mantendo process_subscription_payment
- [x] Remover código Paddle (paddle.ts, paddle.server.ts, use-paddle-checkout) e validar build/testes
- [x] Testar compra aprovada em sandbox (cartão 4242): assinatura ativada, período correto, painel liberado, troca de plano mensal→trimestral confirmada
- [ ] Usuário concluir formulário de ativação no Stripe; depois instalar o aplicativo Lovable na conta real e concluir a conferência de pagamentos

## Landing de conversão e correções (entrega atual)
- [x] Nova chamada, seção de problemas reais e preços sem recursos bloqueados
- [x] Botão único para enviar PDF e aviso no WhatsApp
- [x] Corrigir lista de clientes cortada e etapa que pulava na nova OS
- [x] Menu mostra Assinaturas/Administração

## Separar Assinatura e Administração
- [x] Abas separadas no grupo Plataforma

## Verificação das alterações da Hotmart
- [x] Executar os testes existentes de planos, acesso e integração Hotmart
- [x] Usar os tipos gerados na chamada de processamento de eventos Hotmart
- [x] Confirmar build automático aprovado, páginas sem erros e webhook com GET 200 / POST sem chave 401
- [ ] Confirmar relatório separado da verificação completa de tipos — não disponibilizado pela verificação automática
- [ ] Confirmar compra aprovada e recebimento do primeiro acesso — depende de compra de teste na Hotmart
- [x] Verificar endereço publicado da Hotmart — GET 200 e resposta de saúde correta
- [ ] Realizar teste originado na Hotmart e conferir processamento — depende de envio pelo painel Hotmart e e-mail de teste acessível ao usuário; nenhum evento Hotmart registrado na consulta atual
