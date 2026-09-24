# Plano — Controles operacionais reais

## Objetivo
Transformar os módulos demonstrativos em fluxos funcionais, mantendo o layout atual: cadastros próprios para clientes e peças, vínculo de clientes às ordens, baixa de estoque e documentos imprimíveis.

## Entrega
- Clientes terão tela própria com busca, cadastro e edição, separando nome e documento.
- A criação de ordem terá seletor pesquisável de cliente por nome ou documento e cadastro do equipamento vinculado.
- Estoque terá cadastro de peças, saldo, mínimo, custo, preço, fornecedor, localização e histórico de entradas, saídas e ajustes.
- Itens de estoque adicionados a uma ordem gerarão saída e atualizarão o saldo de forma segura e auditável.
- Ordens terão visualização completa, geração de PDF e comando de impressão.
- Garantias serão emitidas a partir de ordens concluídas, com prazo, cobertura, certificado em PDF e impressão.
- Cada botão abrirá apenas o formulário correspondente ao módulo escolhido.

## Segurança e consistência
- Todas as operações usarão a empresa do usuário autenticado e as regras de acesso já existentes.
- A baixa de estoque será transacional para impedir saldo incorreto ou saída acima da quantidade disponível.
- Movimentações e eventos serão preservados como histórico, sem edição destrutiva.
- Entradas serão validadas antes de salvar e os erros serão apresentados no próprio fluxo.

## Validação
- Testar cadastro e pesquisa de cliente por nome e documento.
- Testar entrada de peça, consumo em ordem e atualização do saldo.
- Testar ordem e garantia em PDF e na pré-visualização de impressão.
- Conferir os fluxos no computador e celular, incluindo estados vazios e mensagens de erro.

## Detalhes técnicos
- Criar funções autenticadas para leitura e gravação, usando as regras multiempresa do banco.
- Adicionar uma função transacional no banco para consumir estoque e registrar a movimentação de forma atômica.
- Usar componentes de seleção pesquisável e documentos HTML próprios para impressão/PDF, compatíveis com português e identidade visual.
- Atualizar os tipos gerados após mudanças estruturais e manter o painel público separado do acesso autenticado.
