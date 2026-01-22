import { Queue } from "bullmq";
import { env } from "../config/env.js";

export const heavyQueue = new Queue("heavy-processing", {
   connection: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    },
});
