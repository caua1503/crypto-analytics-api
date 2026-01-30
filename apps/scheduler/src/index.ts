import { Worker } from "bullmq";
import { heavyQueue } from "./queues/processing.queue";
import { registerDailyScheduler } from "./schedulers/daily.scheduler";
import { prisma } from "./config/db";
import { redisConnection } from "./config/env";

await registerDailyScheduler();

new Worker(
  heavyQueue.name,
  async job => {
    if (job.name !== "dispatch-heavy") return;

    console.log("Dispatch job started");

    const assets = await prisma.asset.findMany({});

    console.log(`Dispatching ${assets.length} assets`);

     await heavyQueue.addBulk(
       assets.map(asset => ({
         name: "process-heavy",
         data: asset
       }))
     );
  },
  { connection: redisConnection }
);

console.log("Scheduler app running");
