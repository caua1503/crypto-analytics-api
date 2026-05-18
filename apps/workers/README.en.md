# Workers

This module is the asynchronous processing engine of the **Crypto Analytics** ecosystem, responsible for executing heavy background tasks, such as real-time data collection from multiple sources and executing the technical and sentiment analysis algorithm.

## Role in the Project

The `workers` unit consumes tasks from a centralized queue, keeping the API lightweight, responsive, and focused purely on serving data quickly. Its main responsibilities include:

- **Queue Processing (BullMQ)**: Consumes resource-intensive tasks from the Redis-backed `processing-queue`.
- **Multidimensional Data Collection**:
  - Real-time asset data (price, volume, market cap) via integrated market APIs.
  - Historical OHLC (Open, High, Low, Close) data for short-to-medium-term trend analysis.
  - Sentiment metrics (Fear & Greed Index) and macro indicators (such as Bitcoin market dominance).
- **Intelligent Cache Management**: Retrieves consolidated global data (e.g., Fear & Greed and macro metrics) directly from **Redis** to prevent rate-limiting on external APIs. Automatically updates the cache with a configured Time-To-Live (TTL) when expired.
- **Snapshot Persistence**: Saves complete market snapshots into the database for analysis and historical auditing.
- **Analysis Engine Execution**: Triggers the mathematical engine (`AnalysisService`) to generate investment recommendations (final score, buy/sell/neutral signals) using the newly captured snapshot.

## Key Technologies

- **BullMQ**: Robust, high-performance Redis-based message queue and job processing library.

## Folder Structure

- `/src/config`: Environment configuration (`env.ts`) and database connection (`db.ts`).
- `/src/index.ts`: Worker entry point, where the BullMQ worker is initialized and job processors are registered.

## Environment Variables

The worker is configured via the following environment variables (managed through `.env` or Docker container variables):

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `NODE_ENV` | `string` | `development` | Execution environment (`development`, `production`, `test`). |
| `REDIS_HOST` | `string` | `localhost` | Redis server host for queues and caching. |
| `REDIS_PORT` | `number` | `6379` | Redis server port. |
| `DATABASE_URL` | `string` | - | Connection URL for the PostgreSQL database. |
| `WORKER_CONCURRENCY` | `number` | `10` | Number of simultaneous tasks the worker will process concurrently. |

## How to Start

### Prerequisites

Ensure that the infrastructure services (Redis and PostgreSQL) are running. The recommended way to spin up the entire ecosystem is using **Docker Compose** from the project's root directory.

### Development Mode

To start the worker locally in development mode (with hot-reload enabled):

```bash
bun run dev
```

### Build for Production

To compile and optimize the worker for production deployment:

```bash
bun run build
```

This compiles a minified binary in the project's shared build folder (`../../build/workers`).
