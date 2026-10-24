# Separar Assinatura e Administração

## O que muda
No menu, dentro do grupo PLATAFORMA, o item único vira dois itens separados:
- **Assinatura** — só o plano da empresa: ciclo atual, situação, próxima cobrança, contratar, trocar ciclo e portal de cobrança.
- **Administração** — só as configurações da empresa: dados, documentos, notificações e demais controles que hoje aparecem abaixo da assinatura.

Cada item abre sua própria tela, com título próprio, funcionando também com o menu recolhido e no celular (o menu fecha ao tocar). Quem hoje vê o item continua vendo os dois; as permissões não mudam.

## Detalhes técnicos
- Trocar a seção "Plataforma" por "Assinatura" e "Administração" no tipo de seção e nos itens de navegação, usando o mesmo controle de navegação já existente.
- Assinatura renderiza o componente de assinatura já compartilhado com a página dedicada; Administração renderiza a visão administrativa atual.
- Atualizar referências que levam a "Plataforma" (atalhos, avisos de cobrança) para apontar para Assinatura.

## Validação
- Abrir cada aba no computador e no celular, confirmando conteúdo separado e sem cortes.

## Sugestões para depois (não incluídas nesta entrega)
Financeiro:
1. **Contas a receber/fiado:** OS entregue com pagamento parcial ou pendente, com saldo devedor e lista de quem deve.
2. **Fechamento de caixa diário:** abertura, sangria, conferência por forma de pagamento (dinheiro, Pix, cartão).
3. **Taxas de cartão:** descontar a taxa da maquininha para mostrar o lucro real.
4. **Despesas recorrentes:** aluguel, internet, luz lançados automaticamente todo mês.
5. **Exportar para contador:** planilha mensal de receitas e despesas.

Operação:
6. **Comissão de técnicos:** percentual por OS concluída.
7. **Lembrete de aparelho parado:** aviso de OS prontas há muitos dias sem retirada.
8. **Alerta de estoque mínimo** na visão geral, com lista de compra.
