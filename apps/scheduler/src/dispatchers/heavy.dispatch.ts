import { Worker } from "bullmq";
import { dispatchQueue, processingQueue } from "../queues/processing.queue";
import { prisma } from "../config/db";
import { redisConnection } from "../config/env";
import { Logger } from "@repo/shared";


export const heavyDispatcher = new Worker(
    dispatchQueue.name,
    async job => {
        const logger = new Logger("HeavyDispatcher");

        if (job.name !== "dispatch-heavy") return;

        logger.log("Dispatch job started");

        const assets = await prisma.asset.findMany({});

        logger.log(`Dispatching ${assets.length} assets`);

        await processingQueue.addBulk(
            assets.map(asset => ({
                name: "process-heavy",
                data: asset
            }))
        );
    },
    { connection: redisConnection }
);
