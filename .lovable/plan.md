# Plano — PontoTech Toledo

## Objetivo
Criar uma plataforma SaaS multiempresa para assistências técnicas, com fluxo completo de ordens de serviço, garantias profissionais, operação financeira, estoque e administração de assinaturas.

## Experiência e identidade
- Interface profissional, rápida e responsiva, otimizada para balcão, oficina e celular.
- Navegação lateral por áreas, busca global e painel com indicadores acionáveis.
- Identidade visual própria da PontoTech Toledo, com contraste alto, tipografia legível e estados claros.
- Painéis densos e fáceis de examinar, sem aparência genérica de página promocional.

## Perfis e isolamento de empresas
- Cadastro e acesso seguro para proprietário, administrador, atendente, técnico e financeiro.
- Cada empresa terá dados, equipe, clientes, estoque, documentos e configurações totalmente isolados.
- Convites de usuários, permissões por função, filiais e trilha de auditoria para ações importantes.
- Configuração inicial guiada: empresa, identidade, dados fiscais básicos, usuários, serviços e termos de garantia.

## Módulos da primeira versão

### 1. Visão geral
- Indicadores de ordens abertas, atrasadas, aguardando aprovação, prontas para entrega e em garantia.
- Receita, valores a receber, ticket médio, produtividade técnica e alertas de estoque baixo.
- Atalhos para nova ordem, novo cliente, entrada de estoque e movimentação financeira.

### 2. Clientes e equipamentos
- Pessoas físicas e jurídicas, contatos, endereços e observações.
- Histórico de atendimentos, garantias e pagamentos.
- Equipamentos com categoria, marca, modelo, número de série/IMEI, acessórios, senha opcional protegida e fotos.

### 3. Ordens de serviço
- Numeração sequencial por empresa e abertura rápida no balcão.
- Fluxo completo: recebimento → triagem → diagnóstico → orçamento → aprovação → reparo → testes → pronto → entrega.
- Status adicionais de cancelamento, sem conserto, aguardando peça e retorno em garantia.
- Defeito relatado, condições de entrada, checklist, fotos, laudo técnico, serviços, peças, descontos e prazos.
- Responsável, técnico, prioridade, previsão, cronologia e histórico de alterações.
- Orçamento com aprovação registrada e comprovante imprimível.
- Busca e filtros por número, cliente, equipamento, técnico, status e período.

### 4. Garantias
- Emissão a partir de uma ordem concluída, cobrindo serviços e/ou peças selecionadas.
- Prazo, início, vencimento, condições, exclusões e observações configuráveis.
- Certificado em PDF com identidade da empresa, dados do cliente, equipamento, itens cobertos e código de autenticidade.
- Visualização para impressão e envio automático por e-mail.
- Retorno em garantia vinculado à ordem original, mantendo todo o histórico.
- Registro de emissão, reenvio, cancelamento e atendimento da garantia.

### 5. Estoque
- Cadastro de peças, categorias, fornecedores, custo, preço, localização e estoque mínimo.
- Entradas, saídas, ajustes, reservas e consumo automático pela ordem de serviço.
- Movimentações auditáveis e alertas de reposição.
- Estoque separado por filial, com visão consolidada para a empresa.

### 6. Financeiro
- Contas a receber e a pagar, categorias, vencimentos, descontos, acréscimos e observações.
- Recebimentos vinculados às ordens, inclusive pagamentos parciais e múltiplas formas de pagamento.
- Fluxo de caixa, inadimplência, despesas, receitas e fechamento por período.
- Relatórios exportáveis com filtros por filial, categoria, situação e período.

### 7. Administração SaaS
- Painel da plataforma para empresas, usuários, planos, limites, assinaturas e situação de pagamento.
- Planos configuráveis por quantidade de usuários, filiais e recursos.
- Período de teste, bloqueio por inadimplência e gestão segura de permissões administrativas.
- Métricas de empresas ativas, usuários, ordens criadas e uso por plano.
- Estrutura pronta para cobrança recorrente; a escolha e ativação do provedor de pagamento será tratada antes dessa etapa.

## Fluxos principais
```text
Cliente + equipamento
        ↓
Recebimento e checklist
        ↓
Diagnóstico → orçamento → aprovação
        ↓
Peças reservadas + execução técnica
        ↓
Testes → pagamento → entrega
        ↓
Garantia em PDF + envio por e-mail
        ↓
Retorno vinculado, quando necessário
```

## Dados e segurança
- Ativar o Lovable Cloud para logins, banco de dados, arquivos e funções do sistema.
- Estrutura multiempresa com vínculo obrigatório da empresa em todos os dados operacionais.
- Regras de acesso no banco, além das permissões visuais, impedindo acesso entre empresas.
- Funções administrativas separadas dos perfis comuns e sempre validadas no servidor.
- Armazenamento privado para fotos, anexos e documentos; links temporários quando necessário.
- Registro de alterações sensíveis, validação de entradas e proteção de dados pessoais.
- Índices, paginação e consultas seletivas para manter alto desempenho com grande volume.

## Implementação por etapas
1. **Base do produto:** identidade visual, estrutura responsiva, Cloud, autenticação, empresas, filiais, usuários e permissões.
2. **Operação central:** clientes, equipamentos, ordens, etapas, anexos, cronologia e painel operacional.
3. **Garantias:** regras, retornos, certificado PDF, impressão e envio por e-mail.
4. **Estoque e financeiro:** movimentações, consumo em ordens, recebimentos, despesas, caixa e relatórios.
5. **Administração SaaS:** planos, limites, assinaturas, métricas e controles da plataforma.
6. **Qualidade final:** acessibilidade, desempenho, segurança, estados vazios/erro, dispositivos móveis e testes completos dos fluxos.

## Detalhes técnicos
- TanStack Start com carregamento otimizado, cache controlado e páginas protegidas por sessão.
- Operações privadas executadas no servidor e regras de acesso por empresa no banco.
- PDF gerado com suporte correto ao português, identidade configurável e validação visual antes da entrega.
- Envio por e-mail feito no servidor, com modelo personalizável e registro de entrega/falha.
- Componentes reutilizáveis para tabelas, filtros, formulários, status, históricos e impressão.
- Metadados próprios em cada página pública; áreas internas permanecerão protegidas e não indexáveis.

## Critérios de aceite
- Duas empresas nunca conseguem visualizar ou alterar dados uma da outra.
- Uma ordem percorre todo o fluxo, consome peças, registra pagamento e gera garantia sem perda de histórico.
- O PDF é legível, imprimível, correto em português e reflete a identidade da empresa.
- Usuários veem e executam apenas ações permitidas por sua função.
- Listas grandes continuam rápidas com busca, filtros e paginação.
- O sistema funciona sem sobreposição ou conteúdo cortado em celular e desktop.
- Fluxos críticos possuem testes e os principais painéis apresentam estados de carregamento, vazio e falha.

## Premissas
- O primeiro canal de envio automático será e-mail; WhatsApp ficará preparado para uma integração posterior.
- Emissão fiscal de nota fiscal não está incluída nesta primeira versão.
- A cobrança recorrente dependerá da escolha do provedor antes da implementação da etapa SaaS financeira.
