import { heavyQueue } from "../queues/processing.queue";

export async function registerDailyScheduler() {
  await heavyQueue.upsertJobScheduler(
    "daily-process",
    { every: 10_000 },
    // { pattern: "* * * * *" },
    {
      name: "dispatch-heavy",
      data: {}
    }
  );
}
