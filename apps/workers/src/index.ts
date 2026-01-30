import { Worker } from "bullmq";
import { redisConnection } from "./config/env.js";




new Worker(
  "heavy-processing",
  async job => {
    if (job.name !== "process-heavy") return;

    console.log("⚙️ Processando:", job.data);

    // await new Promise(r => setTimeout(r, 300));

    // console.log("✅ Finalizado:", job.data.id);
  },
  {
    connection: redisConnection,
    concurrency: 5
  }
);

console.log("👷 Worker rodando");
