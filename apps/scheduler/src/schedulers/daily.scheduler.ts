import { dispatchQueue } from "../queues/processing.queue";

export async function registerDailyScheduler() {
  await dispatchQueue.upsertJobScheduler(
    "daily-process",
    // { every: 10_000 },
    { pattern: "0 22 * * *" },
    {
      name: "dispatch-heavy",
      data: {}
    }
  );
}
