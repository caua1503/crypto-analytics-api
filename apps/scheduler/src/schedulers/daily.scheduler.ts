import { heavyQueue } from "../queues/processing.queue";

export async function registerDailyScheduler() {
  await heavyQueue.upsertJobScheduler(
    "daily-process",
    { pattern: "0 7 * * *" },
    {
      name: "dispatch-heavy",
      data: {}
    }
  );
}
