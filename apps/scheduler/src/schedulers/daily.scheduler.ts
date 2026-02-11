import { dispatchQueue } from "../queues/processing.queue";

export async function registerDailyScheduler() {
  await dispatchQueue.upsertJobScheduler(
    "daily-process",
    { every: 60_000 },
    // { pattern: "0 22 * * *" },
    {
      name: "dispatch-heavy",
      data: {}
    }
  );
}
