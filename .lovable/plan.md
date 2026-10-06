# Plano profissional — PontoTech Toledo

## Objetivo
Transformar o sistema atual em um SaaS profissional para assistências técnicas, sem emissão de notas fiscais, com operação segura por empresa e assinaturas mensal, trimestral e anual.

## O que já existe
- Cadastros reais de clientes, aparelhos, ordens, peças, garantias, vendas e lançamentos financeiros.
- Estoque com entrada, saída, consumo de peça pela OS e alerta de reposição.
- Checklist por categoria de aparelho, impressão de OS/garantia e mensagens manuais pelo WhatsApp.
- Login, isolamento dos dados por empresa, armazenamento de logo e base de assinatura.
- Plano mensal de teste criado por **R$ 29,90**.

## Etapa 1 — Estabilidade e base técnica
- Corrigir erros remanescentes de compilação e remover supressões de tipos dos arquivos críticos.
- Atualizar os tipos do banco e eliminar tratamentos que escondem falhas de consulta.
- Dividir o painel principal em telas e módulos menores, preservando a identidade PontoTech Toledo.
- Criar testes dos fluxos essenciais: login, cliente, aparelho, OS, baixa de peça, garantia e assinatura.
- Exibir mensagens claras de erro e confirmação em todas as gravações.

## Etapa 2 — Planos e pagamentos
- Manter um único produto PontoTech com três ciclos:
  - **Mensal:** R$ 29,90 por mês.
  - **Trimestral:** R$ 69,90 a cada três meses.
  - **Anual:** R$ 297,00 por ano.
- Criar os preços trimestral e anual no ambiente de teste e permitir selecionar o ciclo antes do pagamento.
- Criar a tela **Minha assinatura**, mostrando plano, situação, próxima cobrança e período contratado.
- Conectar o pagamento ao acesso real do sistema; hoje o login não depende da assinatura.
- Oferecer portal seguro para trocar forma de pagamento, cancelar e consultar cobranças.
- Tratar renovação, cancelamento, pagamento recusado e troca de ciclo.
- Aplicar **7 dias de tolerância** após falha de pagamento, com avisos progressivos; depois disso, permitir consulta e exportação, mas bloquear novos cadastros e alterações.
- Preservar acesso até o fim do período já pago quando houver cancelamento.
- Validar webhooks, ambiente de teste/live e conciliar automaticamente o pagamento com a empresa correta.

## Etapa 3 — Operação completa da assistência
- Expor o fluxo completo da OS: recebida, triagem, diagnóstico, orçamento, aguardando aprovação, aprovada, aguardando peça, reparo, testes, pronta, entregue, cancelada, sem reparo e retorno em garantia.
- Criar orçamento com aprovação/reprovação do cliente, valores de mão de obra, peças, desconto e prazo.
- Permitir atribuir técnico, prioridade, prazo previsto e observações internas.
- Criar histórico cronológico da OS, registrando usuário, data e alteração realizada.
- Criar cadastro próprio do aparelho, com histórico de reparos, garantias e reincidências.
- Tornar checklists configuráveis por empresa e categoria, com campos obrigatórios, fotos e assinatura de recebimento/entrega.
- Melhorar documentos A4 e térmicos com logo, empresa, cliente, aparelho, checklist, itens, termos e assinaturas.

## Etapa 4 — Estoque profissional
- Separar claramente **peças de assistência** e **produtos de loja**; somente peças podem ser consumidas em uma OS.
- Adicionar fornecedores, compras/entradas, custo médio, localização, inventário e ajuste com justificativa.
- Criar reserva de peça para OS, devolução, estorno e rastreabilidade completa de cada movimento.
- Incluir alertas de estoque mínimo, itens sem giro, margem e necessidade de reposição.
- Adicionar relatórios e exportação CSV de saldo, movimentação, consumo por OS e valorização do estoque.

## Etapa 5 — Equipe, permissões e segurança
- Criar gestão de usuários por empresa com convite, ativação/desativação e redefinição de acesso.
- Aplicar os perfis já previstos: proprietário, administrador, atendente, técnico e financeiro.
- Restringir cada tela e operação no servidor e no banco, não apenas ocultar botões.
- Remover usuários/e-mails específicos gravados no login e tornar o acesso totalmente multiempresa.
- Criar registro de auditoria para alterações de clientes, ordens, estoque, garantias, finanças e configurações.
- Acrescentar controles de sessão, proteção contra abuso e rotinas de recuperação/exportação dos dados.

## Etapa 6 — Comunicação e acompanhamento do cliente
- Manter WhatsApp com mensagem pronta como opção inicial, acrescentando avisos para OS aberta, orçamento, em reparo, pronta e finalizada.
- Criar página pública segura de acompanhamento por código/token, sem expor outros dados da empresa.
- Registrar quando a mensagem foi preparada/enviada pelo atendente.
- Preparar integração futura com WhatsApp oficial para envio automático, mediante contratação do serviço.
- Implementar envio de garantia e documentos por e-mail com registro de entrega ou falha.

## Etapa 7 — Financeiro e gestão, sem notas fiscais
- Evoluir o financeiro para contas a pagar/receber, vencimentos, pagamentos parciais, categorias e fluxo de caixa.
- Criar abertura/fechamento de caixa, sangria, suprimento e conciliação dos recebimentos.
- Relacionar receitas, custos de peças e mão de obra às ordens para calcular lucro real.
- Criar indicadores de prazo médio, conversão de orçamentos, produtividade por técnico, retorno em garantia, faturamento e margem.
- Adicionar filtros por período, filial, técnico e situação, com exportação CSV/PDF.

## Ordem recomendada de entrega
1. Estabilidade, tipos e testes críticos.
2. Assinaturas com os três ciclos e controle de acesso.
3. Fluxo completo da OS, histórico e permissões.
4. Estoque profissional e rastreabilidade.
5. Comunicação e acompanhamento do cliente.
6. Financeiro, relatórios e indicadores.

## Critérios de conclusão
- Dados permanecem iguais em celular e computador e são isolados por empresa.
- Nenhum fluxo principal depende de dados fictícios ou estado apenas do navegador.
- Um pagamento de teste ativa o acesso da empresa e os eventos de renovação/cancelamento refletem no sistema.
- Usuários só executam ações permitidas pelo seu perfil.
- Toda alteração importante deixa histórico auditável.
- Os fluxos principais são testados de ponta a ponta em computador e celular.
- A publicação não possui erros de compilação, execução ou falhas críticas de segurança.
