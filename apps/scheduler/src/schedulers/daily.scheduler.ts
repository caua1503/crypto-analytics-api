import { dispatchQueue } from "../queues/processing.queue";

export async function registerDailyScheduler() {
  await dispatchQueue.upsertJobScheduler(
    "daily-process",
    { every: 10_000 },
    // { pattern: "* * * * *" },
    {
      name: "dispatch-heavy",
      data: {}
    }
  );
}
