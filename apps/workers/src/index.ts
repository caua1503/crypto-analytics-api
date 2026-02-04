import { Worker } from "bullmq";
import { redisConnection } from "./config/env.js";

const QUEUE_NAME = "processing-queue";

new Worker(
    QUEUE_NAME,
    async (job) => {
        if (job.name !== "process-heavy") return;

        console.log("⚙️ Processando:", job.data);

        // await new Promise(r => setTimeout(r, 300));

        // console.log("✅ Finalizado:", job.data.id);
    },
    {
        connection: redisConnection,
        concurrency: 5,
    },
);

console.log("👷 Worker rodando");
