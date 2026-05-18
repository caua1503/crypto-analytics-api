import { Queue } from "bullmq";
import { redisConnection } from "../config/env.js";

export const dispatchQueue = new Queue("dispatch-queue", {
	connection: redisConnection,
});

export const processingQueue = new Queue("processing-queue", {
	connection: redisConnection,
});
