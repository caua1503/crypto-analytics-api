# Scheduler

Este módulo é o cérebro de agendamento e orquestração do ecossistema **Crypto Analytics**, responsável por cronometrar a execução periódica de tarefas pesadas de análise e garantir que as filas de processamento em segundo plano sejam alimentadas de forma equilibrada.

## Função no Projeto

A unidade `scheduler` gerencia o ciclo de vida temporal de coleta de dados e análise, utilizando uma arquitetura orientada a eventos para disparar e distribuir carga de trabalho. Suas principais responsabilidades incluem:

- **Agendamento Cron (BullMQ Job Schedulers)**: Registra agendadores recorrentes baseados em padrões cron. Por padrão, possui o agendador `daily-process` que roda a cada 6 horas (às 00:10, 06:10, 12:10 e 18:10) para disparar a atualização de mercado.
- **Orquestração e Dispatching (`heavyDispatcher`)**: Consome o evento `dispatch-heavy` e realiza a carga inicial necessária para o ciclo de análise:
  - **Semeação de Dados Globais**: Coleta métricas globais (como Fear & Greed Index e dados macroeconômicos) de APIs externas e os salva centralizadamente no **Redis** com tempo de vida (TTL) de 1 hora. Isso evita que dezenas de workers façam requisições redundantes a APIs externas concorrentemente.
  - **Fatiamento de Carga (Batching)**: Consulta todos os ativos cadastrados no banco de dados, divide-os em pequenos lotes (com tamanho parametrizável via `BATCH_SIZE`) e os adiciona em lote (**Bulk Add**) na fila de processamento.
- **Divisão de Filas**:
  - `dispatch-queue`: Canal exclusivo para disparos de rotinas de agendamento e orquestração global.
  - `processing-queue`: Fila para a qual as tarefas pesadas de cada lote de ativos são despachadas para consumo pelos **Workers**.

## Tecnologias Chave

- **BullMQ**: Biblioteca de processamento de filas e agendamento de tarefas recorrentes baseada em Redis de alta performance e robustez.

## Estrutura de Pastas

- `/src/config`: Configurações de ambiente (`env.ts`) e conexão com o banco de dados (`db.ts`).
- `/src/dispatchers`: Processadores que realizam a preparação de dados globais e o fatiamento dos ativos em lotes.
- `/src/queues`: Definição das instâncias de filas do BullMQ (`dispatch-queue` e `processing-queue`).
- `/src/schedulers`: Definição e registro dos cronogramas recorrentes de execução de tarefas.
- `/src/index.ts`: Ponto de entrada do scheduler, onde os agendamentos são registrados e os dispatchers entram em operação.

## Variáveis de Ambiente

O scheduler é parametrizado pelas seguintes variáveis no seu ambiente de execução:

| Variável | Tipo | Padrão | Descrição |
|----------|------|--------|-----------|
| `NODE_ENV` | `string` | `development` | Ambiente de execução (`development`, `production`, `test`). |
| `REDIS_HOST` | `string` | `localhost` | Endereço do servidor Redis para filas e agendamentos. |
| `REDIS_PORT` | `number` | `6379` | Porta do servidor Redis. |
| `DATABASE_URL` | `string` | - | URL de conexão com o banco de dados PostgreSQL. |
| `BATCH_SIZE` | `number` | `100` | Limite de ativos enviados em cada job individual para a fila dos workers. |

## Como Iniciar

### Pré-requisitos

Certifique-se de que os serviços de infraestrutura (Redis e PostgreSQL) estejam rodando. A maneira recomendada de iniciar todo o ecossistema é via **Docker Compose** no diretório raiz do projeto.

### Modo de Desenvolvimento

Para iniciar o scheduler localmente em modo de desenvolvimento (com hot-reload ativado):

```bash
bun run dev
```

### Compilar para Produção

Para criar um executável compilado e otimizado para produção:

```bash
bun run build
```

Isso gerará o executável otimizado no diretório de build compartilhado do projeto (`../../build/scheduler`).
