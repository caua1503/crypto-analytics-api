import { Worker } from "bullmq";
import { dispatchQueue, processingQueue } from "./queues/processing.queue";
import { registerDailyScheduler } from "./schedulers/daily.scheduler";
import { prisma } from "./config/db";
import { redisConnection } from "./config/env";
import { heavyDispatcher } from "./dispatchers/heavy.dispatch";

async function main() {
  await registerDailyScheduler();

  const dispatchers = [
    heavyDispatcher
  ];

  console.log(`\n🚀 Scheduler running with ${dispatchers.length} active dispatchers\n`);
}



main().catch(console.error);
