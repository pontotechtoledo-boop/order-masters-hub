# Página de venda e assinatura antes da senha

## Resultado esperado
Uma página mais persuasiva, com azuis mais presentes e duas entradas: comprar o plano agora ou criar a conta para conhecer o sistema com as abas bloqueadas.

## 1. Página de venda
- Manter a identidade Service Pro OS, Sora/Manrope e os três preços: R$ 29,90 mensal, R$ 69,90 trimestral e R$ 299,90 anual.
- Reforçar o azul técnico com contraste e uma imagem própria do produto na abertura, sem copiar a composição do concorrente.
- Exibir Service Pro OS em destaque; trazer já na primeira tela a motivação para agir: “Não deixe mais um atendimento sem registro.”
- Apoiar a mensagem com benefícios concretos: fotos e checklist, garantia vinculada à OS, peças e lucro sob controle.
- Mostrar preço inicial, compra segura e garantia própria de reembolso de 7 dias perto do botão principal.
- Botões: “Assinar agora” e “Acesse e conheça o sistema”. Aproximar planos, telas reais e respostas às objeções.
- Não usar cronômetro, vagas limitadas, depoimentos inventados, promessa de reajuste iminente ou preço congelado para sempre.

## 2. Comprar antes de escolher a senha
1. A pessoa escolhe um plano na página pública.
2. Informa nome, e-mail, nome da assistência e CPF/CNPJ válido, aceita os termos e abre o pagamento Stripe na própria página, sem criar senha nesse momento.
3. A contratação fica pendente até o pagamento confirmado. Fechar a janela ou voltar do Stripe não libera acesso.
4. Após a confirmação, recebe agradecimento e um link seguro para concluir o cadastro e criar a senha.
5. Concluído o cadastro, a assinatura já paga fica vinculada à conta correta; a pessoa recebe o link https://serviceproos.app/auth e pode usar o sistema.
- Manter os requisitos atuais da senha e a proteção contra senhas vazadas.
- Se o e-mail já tiver conta, solicitar login ou recuperação antes de cobrar; nunca criar outra conta nem transferir uma assinatura só por coincidência de e-mail.
- Oferecer recuperação do acesso e reenvio seguro caso o cliente perca o link, sem pedir outra compra.

## 3. Preservar o que já existe
- Cadastro antes da compra continua disponível, com visão prévia e todas as abas visíveis e bloqueadas.
- Contratação dentro do sistema continua vinculada à pessoa autenticada e à sua assistência.
- Compras e renovações confirmadas mantêm os e-mails com link de login.
- Manter renovação automática, liberação após pagamento, tolerância de 7 dias e troca trimestral/anual na próxima renovação paga.
- Cancelamento mantém o período pago; reembolso e contestação seguem as regras existentes.

## 4. Conferência para começar a vender
**Confirmado nesta análise:** Stripe liberado para produção; domínio de envio notify.serviceproos.app verificado; página inicial, cadastro e login públicos respondem por HTTPS.

**Ainda não confirmado:** versão publicada com todos os ajustes recentes, nova compra antes da senha, compra real seguida de acesso liberado e entrega na caixa de entrada. A consulta atual não contém assinaturas, portanto não comprova uma venda recente processada.

- Conferir novamente os três preços e os eventos de pagamento nos ambientes de teste e produção.
- Testar em celular e computador os dois caminhos de compra, e-mail repetido, CPF/CNPJ inválido, pagamento recusado e confirmação pendente.
- Testar pagamento aprovado, ativação por e-mail, definição de senha, login e leitura da assinatura pela interface.
- Testar notificações repetidas/fora de ordem, falha e reenvio de e-mail, renovação e mudança de ciclo sem duplicar assinatura.
- Validar reembolso/contestação e bloqueio de operações sem pagamento.
- Separar o resultado em “pronto e testado”, “aguarda publicação” e “aguarda pagamento real/recebimento do e-mail”. Nenhuma cobrança real será feita pelo agente.
- Após publicação pelo responsável, conferir a versão pública e acompanhar uma compra real controlada antes de ampliar os anúncios; a renovação real futura continuará sendo acompanhada separadamente.

## Detalhes técnicos
- Reutilizar Stripe Embedded Checkout e o cliente Stripe compartilhado, com preços e ambiente validados no servidor.
- Acrescentar uma entidade privada de contratação inicial, com identidade gerada pelo servidor, sessão Stripe persistida e estados de pagamento/ativação separados. Não expor listas de usuários nem documentos ao público.
- Vincular conta e empresa apenas após pagamento assinado e prova de posse do e-mail. Usar convite de autenticação ou capacidade aleatória, expirável e de uso único; não transformar pagamento em confirmação automática de e-mail.
- Não vincular clientes Stripe antigos por e-mail sem verificar sua propriedade. Prevenir concorrência e duplicidade também no processamento transacional.
- Estender o processamento atual para reconhecer as contratações públicas sem relaxar as permissões das contratações autenticadas.
- Enviar e-mails de pagamento somente a partir de invoice.paid verificado, com idempotência por pagamento; enviar conclusão de cadastro por evento de ativação confirmado, com chave própria. Permitir repetição de envio sem estender acesso ou cobrar novamente.
- Validar CPF/CNPJ também no servidor e manter políticas, permissões e testes das novas regras. Atualizar documentação de arquitetura e política de privacidade para o novo fluxo.