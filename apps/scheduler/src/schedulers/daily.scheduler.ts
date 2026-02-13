import { dispatchQueue } from "../queues/processing.queue";

export async function registerDailyScheduler() {
  await dispatchQueue.upsertJobScheduler(
    "daily-process",
    {
      // every: 10_000,
      //sempre alterar a data para o dia seguinte ao deploy
      every: 216_000_000,
      startDate: new Date('2026-02-14T00:00:00Z'), // start on February 14, 2026
    },
    // { pattern: "0 22 * * *" },
    {
      name: "dispatch-heavy",
      data: {}
    }
  );
}
