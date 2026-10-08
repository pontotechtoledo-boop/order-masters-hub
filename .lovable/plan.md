# Assinaturas — PontoTech Toledo

## Escopo desta entrega
Implementar somente a venda e a gestão das assinaturas do sistema. Melhorias de ordens, estoque, equipe, relatórios e comunicação ficam para depois. Não incluir emissão de notas fiscais.

## Situação confirmada
- O Paddle possui um produto e um preço mensal de teste de R$ 29,90.
- O projeto tem código de checkout e recebimento de eventos de pagamento, mas não oferece uma tela para contratar.
- O acesso atual verifica o login, mas não a assinatura da empresa.

## Planos
Todos os ciclos dão acesso aos mesmos recursos, por empresa, com renovação recorrente:

| Ciclo | Valor por cobrança | Renovação |
|---|---:|---|
| Mensal | R$ 29,90 | A cada mês |
| Trimestral | R$ 69,90 | A cada 3 meses |
| Anual | R$ 297,00 | A cada ano |

Os valores exibidos devem coincidir com os cobrados. Validar a configuração tributária do checkout para evitar acréscimos inesperados ao preço anunciado.

## O que implementar
1. **Minha assinatura:** acesso pelo painel, escolha do ciclo, preço, situação, vencimento/próxima cobrança e botão para contratar ou regularizar.
2. **Checkout Paddle:** acrescentar os preços trimestral e anual ao produto existente, mantendo o mensal. Disponibilizar as formas de pagamento suportadas pelo Paddle para o cliente; não prometer Pix ou boleto sem confirmar disponibilidade e compatibilidade com renovação.
3. **Ativação segura:** vincular a compra à empresa autenticada, validar quem pode contratar e impedir assinaturas duplicadas. Liberar acesso após confirmação oficial do pagamento, nunca apenas pelo retorno do checkout.
4. **Gestão:** portal para consultar cobranças, atualizar forma de pagamento e cancelar. Por padrão, cancelamento mantém acesso até o fim do período pago; troca de ciclo entra na próxima renovação, sem cobrança proporcional inesperada.
5. **Inadimplência:** sete dias de tolerância a partir da primeira falha da renovação, com aviso e caminho de regularização. Reenvios do evento não reiniciam o prazo. Após sete dias, bloquear novos cadastros, alterações e exclusões, mantendo consulta e exportação dos dados da empresa. Recuperar o acesso após pagamento confirmado.
6. **Contas existentes:** verificar os períodos de teste e as assinaturas reais antes de ativar restrições; apresentar uma transição clara sem apagar dados nem bloquear silenciosamente os clientes atuais.
7. **Pagamentos reais:** verificar a situação de aprovação comercial do Paddle e informar eventuais pendências. Criar e testar preços no ambiente de teste; sincronizar para live pelo processo de publicação, sem publicar automaticamente.

## Detalhes técnicos
- Referenciar preços por identificadores estáveis: `pontotech_monthly`, `pontotech_quarterly` e `pontotech_yearly`. Configurar o trimestral com intervalo de mês e frequência 3.
- Centralizar a situação da assinatura por organização, separando ambientes de teste e live em todas as consultas e verificações.
- Autorizar contratação e portal por vínculo e papel na empresa; não confiar em identificadores enviados pelo navegador sem validação.
- Endurecer o webhook com assinatura válida, processamento idempotente, proteção contra eventos fora de ordem e erros visíveis/reprocessáveis.
- Registrar falha inicial de cobrança e prazo de tolerância de forma persistente.
- Aplicar restrição de escrita no banco e nas funções de servidor, inclusive nas funções de estoque e vendas; esconder botões é apenas apoio visual.
- Manter login, consulta, exportação e regularização acessíveis após suspensão de escrita.
- Corrigir apenas erros técnicos necessários a esta entrega, sem reestruturar os módulos operacionais.

## Validação
- Testes concretos para R$ 29,90/mês, R$ 69,90/3 meses e R$ 297,00/ano.
- Testar ativação, renovação, cancelamento ao fim do período e recuperação após inadimplência.
- Testar o limite exato de sete dias e garantir que eventos repetidos não prolonguem a tolerância.
- Confirmar isolamento por empresa e impossibilidade de alterar dados durante suspensão, inclusive por chamadas diretas.
- Executar um pagamento de teste pelo sistema e confirmar que a assinatura aparece e libera o acesso da empresa correta.
- Verificar a tela em computador e celular e corrigir erros de compilação e execução relacionados antes da conclusão.

## Resultado esperado
O cliente poderá escolher um dos três ciclos, pagar, acompanhar e gerenciar sua assinatura; o sistema aplicará as regras de acesso sem perder seus dados.
