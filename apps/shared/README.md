# @repo/shared

Bem-vindo ao módulo **Shared**! Esta é a biblioteca interna principal do projeto `crypto-analytics-api`, projetada para centralizar serviços fundamentais, modelos de dados, utilitários, integrações e lógicas de segurança que são consumidas por praticamente todos os outros módulos (workers, rotas de API, etc). 

Além de ser uma biblioteca compartilhada, **este módulo atua como uma aplicação independente (CLI) responsável por iniciar e executar as migrações dos bancos de dados** em ambientes de produção através de um binário compilado.

## Objetivo

O objetivo deste pacote é evitar duplicação de dados e promover consistência usando **Domain-Driven Design (DDD)** onde prático. Todo acesso aos bancos de dados, integrações externas e lógicas comuns a vários domínios encontram-se aqui.

## Tecnologias Principais

- **[Bun]**: Runtime rápido para execução e tipagem, além do acesso a módulos nativos como `CryptoHasher` e `Redis`.
- **[Prisma]**: ORM configurado com múltiplos _schemas_ (Market e User).
- **[Zod]**: Para esquemas de validação unificados.
---

## Estrutura de Diretórios

O diretório `src/` está organizado da seguinte maneira:

```plaintext
src/
├── core/         # Lógica central (Segurança, Criptografia de Tokens, Controle de Acesso a rotas e filas).
├── integrations/ # Integrações com APIs externas (CoinGecko, CoinMarketCap, etc).
├── services/     # Serviços de acesso e manipulação do DB (User, Market, Assets).
├── types/        # Tipagens TypeScript globais e Schemas Zod.
├── utils/        # Facilidades auxiliares (Parser de .env configurado com Zod).
└── db.ts         # Instanciação global e única (Singleton) do Prisma Client e do Redis.
```

## Segurança e Controle de Acesso (`src/core/security.ts`)

Este pacote possui os recursos centrais de proteção da `crypto-analytics-api`:
- **Autenticação e Sessões**: Validação de _Bearer Tokens_ (JWT) ou _API Keys_.
- **RBAC (Role-Based Access Control)**: Tratamento e prioridade de acessos baseado na subscrição ou permissão do usuário.
- **Criptografia Rápida e Segura**: Uso do `Bun.CryptoHasher` (em substituição ao pacote de backend `crypto` do Node) na verificação de chaves de API comparando com suas hashes gravadas em banco, de forma performática.
- **Whitelist de IP**: Proteção de chaves de APIs vinculadas a IPs específicos.

## Integrações Externas

Dentro de `integrations/`, é onde definimos os adaptadores para o enriquecimento da nossos dados. Os adaptadores atuam unificando os modelos externos de dados do mundo _crypto_ para os modelos operacionais internos:
- **Indexadores e Cotações**: _CoinGecko_, _CoinMarketCap_, _CoinCaprika_.
- **Fatores Quantitativos/Qualitativos**: Medidor _Fear & Greed Index_ e calculadoras proprietárias de predição e indicadores técnicos.

## Acesso e Migração de Banco de Dados

O projeto utiliza o ORM via **Prisma** e lida com bases de dados em escopos distintos usando múltiplos _configs_:
- `prisma.config.ts`: Base primária (Mercado e Assets).
- `prisma.user.config.ts`: Base de Identidade/Usuários.

Os serviços (`src/services/*`) orquestram toda entrada e saída da aplicação, contendo métodos injetáveis e isolados e tratando a lógica de negócio principal (`AnalysisService`, `UserService`, `MarketService`, etc).

**Responsabilidade de Migração:** O script `migrate.ts` presente na raiz do módulo centraliza a implementação e execução programática da configuração e migração contínua dos diferentes bancos de dados atrelados aos diferentes schemas do Prisma no deploy do projeto, sendo possível invocar diretamente a inicialização dos bancos a partir daqui usando o comando padrão `migrate`.

---

## Comandos e Scripts Disponíveis

Neste diretório ou na própria raiz do projeto via _workspaces_, você possui os seguintes scripts úteis de manipulação da base:

| Comando | Descrição |
| --- | --- |
| `bun run build` | Compila o executor das migrações num binário único. |
| `bun run migrate` | Executa o script central de migrações (`migrate.ts`). |
| `bun run db:generate` | Gera o Prisma Client com os tipos atualizados em todos os _schemas_. |
| `bun run db:migrate` | Roda `prisma migrate deploy` em todos os bancos de dados configurados. |
| `bun run db:dev` | Aplica migrações iterativas (como em dev) nas diversas bases. |

> É possível também rodar comandos isolados de schema (ex: `bun run db:migrate:user` ou `bun run db:generate:market`).
