import { dispatchQueue } from "../queues/processing.queue";

export async function registerDailyScheduler() {
  await dispatchQueue.upsertJobScheduler(
    "daily-process",
    {
      // every: 10_000,
      //sempre alterar a data para o dia seguinte ao deploy
      // every: 21_600_000,
      // startDate: new Date('2026-02-18T18:00:00Z'), // start on February 18, 2026
      pattern: "0 */6 * * *", // a cada 6h, minuto 0
    },
    // { pattern: "0 22 * * *" },
    {
      name: "dispatch-heavy",
      data: {}
    }
  );
}
