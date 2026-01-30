import { Queue } from "bullmq";
import { redisConnection } from "../config/env.js";


export const heavyQueue = new Queue("heavy-processing", {
    connection: redisConnection,
});
