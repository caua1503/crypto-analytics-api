# Workers

Este módulo é o motor de processamento assíncrono do ecossistema **Crypto Analytics**, responsável por executar tarefas pesadas em background, como a coleta de dados em tempo real de múltiplas fontes e a execução do algoritmo de análise técnica e de sentimento.

## Função no Projeto

A unidade `workers` consome tarefas de uma fila centralizada, permitindo que a API permaneça leve, responsiva e focada apenas em servir dados de forma rápida. Suas principais responsabilidades incluem:

- **Processamento de Filas (BullMQ)**: Consome tarefas pesadas da fila `processing-queue` estruturada com Redis.
- **Coleta Multidimensional de Dados**:
  - Dados em tempo real (preço, volume, market cap) via APIs de mercado integradas.
  - Dados históricos em formato OHLC (Open, High, Low, Close) para análise de tendência de curto/médio prazo.
  - Métricas de sentimento (Fear & Greed Index) e indicadores macro (como a dominância de mercado do Bitcoin).
- **Gerenciamento Inteligente de Cache**: Busca dados globais consolidados (como Fear & Greed e dados macro) diretamente do **Redis** para evitar excesso de requisições a APIs externas. Atualiza o cache automaticamente com tempo de vida (TTL) configurado caso esteja expirado.
- **Persistência de Snapshots**: Grava snapshots completos de mercado no banco de dados para fins de análise e auditoria histórica.
- **Execução do Motor de Análise**: Aciona a engine matemática (`AnalysisService`) para gerar recomendações de investimento (score final, sinais de compra/venda/neutro) a partir do snapshot coletado.

## Tecnologias Chave

- **BullMQ**: Biblioteca de processamento de filas e mensagens baseada em Redis de alta performance e robustez.

## Estrutura de Pastas

- `/src/config`: Configurações de ambiente (`env.ts`) e conexão com banco de dados (`db.ts`).
- `/src/index.ts`: Ponto de entrada do worker, onde a fila do BullMQ é inicializada e os processadores de jobs são registrados.

## Variáveis de Ambiente

O worker é parametrizado através das seguintes variáveis de ambiente (gerenciadas via `.env` ou variáveis do container Docker):

| Variável | Tipo | Padrão | Descrição |
|----------|------|--------|-----------|
| `NODE_ENV` | `string` | `development` | Ambiente de execução (`development`, `production`, `test`). |
| `REDIS_HOST` | `string` | `localhost` | Endereço do servidor Redis para filas e cache. |
| `REDIS_PORT` | `number` | `6379` | Porta do servidor Redis. |
| `DATABASE_URL` | `string` | - | URL de conexão com o banco de dados PostgreSQL. |
| `WORKER_CONCURRENCY` | `number` | `10` | Quantidade de tarefas simultâneas que o worker processará concorrentemente. |

## Como Iniciar

### Pré-requisitos

Certifique-se de que os serviços de infraestrutura (Redis e PostgreSQL) estejam rodando. A maneira recomendada de iniciar todo o ecossistema é via **Docker Compose** no diretório raiz do projeto.

### Modo de Desenvolvimento

Para iniciar o worker localmente em modo de desenvolvimento (com hot-reload ativado):

```bash
bun run dev
```

### Compilar para Produção

Para criar um executável compilado e otimizado para produção:

```bash
bun run build
```

Isso gerará o executável otimizado no diretório de build compartilhado do projeto (`../../build/workers`).
