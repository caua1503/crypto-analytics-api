import dotenv from "dotenv";
import { Queue } from "bullmq";
import { env } from "./config.js";

const criptoProcessQueue = "crypto-process-queue";

const myQueue = new Queue(criptoProcessQueue, {
  connection: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
  },
});
