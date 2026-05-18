# Scheduler

This module is the scheduling and orchestration brain of the **Crypto Analytics** ecosystem, responsible for timing the periodic execution of resource-intensive analysis tasks and ensuring background processing queues are balanced and properly populated.

## Role in the Project

The `scheduler` unit manages the time-based lifecycle of data collection and analysis, leveraging an event-driven architecture to trigger and distribute workload. Its main responsibilities include:

- **Cron Scheduling (BullMQ Job Schedulers)**: Registers recurring job schedulers using cron patterns. By default, it features the `daily-process` scheduler running every 6 hours (at 00:10, 06:10, 12:10, and 18:10) to initiate market analysis cycles.
- **Orchestration & Dispatching (`heavyDispatcher`)**: Consumes the `dispatch-heavy` event and handles the initial setup required for the analysis cycle:
  - **Global Data Seeding**: Fetches global metrics (such as the Fear & Greed Index and macroeconomic data) from external APIs and saves them centraly in **Redis** with a 1-hour TTL. This prevents multiple workers from executing duplicate API calls concurrently.
  - **Workload Batching (Chunking)**: Queries all registered cryptocurrency assets in the database, divides them into smaller batches (sized via the configurable `BATCH_SIZE` variable), and sends them in bulk (**Bulk Add**) to the processing queue.
- **Queue Segregation**:
  - `dispatch-queue`: Exclusive queue for global orchestration and scheduling triggers.
  - `processing-queue`: The target queue where heavy asset batch jobs are sent for consumption by the **Workers**.

## Key Technologies

- **BullMQ**: Robust, high-performance Redis-based queue and recurring job scheduling library.

## Folder Structure

- `/src/config`: Environment configuration (`env.ts`) and database connection (`db.ts`).
- `/src/dispatchers`: Workers that prepare global data cache and slice assets into batches.
- `/src/queues`: Definition of BullMQ queues (`dispatch-queue` and `processing-queue`).
- `/src/schedulers`: Definition and registration of recurring cron timers.
- `/src/index.ts`: Scheduler entry point, where recurring schedules are registered and dispatchers are booted.

## Environment Variables

The scheduler is configured via the following environment variables:

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `NODE_ENV` | `string` | `development` | Execution environment (`development`, `production`, `test`). |
| `REDIS_HOST` | `string` | `localhost` | Redis server host for queues and schedules. |
| `REDIS_PORT` | `number` | `6379` | Redis server port. |
| `DATABASE_URL` | `string` | - | Connection URL for the PostgreSQL database. |
| `BATCH_SIZE` | `number` | `100` | Maximum number of assets bundled per individual job in the workers queue. |

## How to Start

### Prerequisites

Ensure that the infrastructure services (Redis and PostgreSQL) are running. The recommended way to spin up the entire ecosystem is using **Docker Compose** from the project's root directory.

### Development Mode

To start the scheduler locally in development mode (with hot-reload enabled):

```bash
bun run dev
```

### Build for Production

To compile and optimize the worker for production deployment:

```bash
bun run build
```

This compiles a minified binary in the project's shared build folder (`../../build/scheduler`).
