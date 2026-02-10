import { Worker } from "bullmq";
import { dispatchQueue, processingQueue } from "../queues/processing.queue";
import { prisma } from "../config/db";
import { redisConnection } from "../config/env";
import { Logger, RedisClient, redis } from "@repo/shared";
import { getMarketDataService, FearAndGreedIndex } from "@repo/shared/integrations";

const marketDataIntegration = getMarketDataService();
const fearGreedService = new FearAndGreedIndex();
const redisClient = new RedisClient(redis);

export const heavyDispatcher = new Worker(
    dispatchQueue.name,
    async job => {
        const logger = new Logger("HeavyDispatcher");

        if (job.name !== "dispatch-heavy") return;

        logger.log("🚀 Iniciando dispatch de mercado...");

        try {
            logger.log("🌐 Coletando e semeando dados globais (Macro + Fear & Greed)...");
            const macroData = await marketDataIntegration.fetchMacroData();
            const fearGreed = await fearGreedService.getIndexValue();

            await redisClient.set_json("macroData", macroData, 60 * 60); // 1 hora
            await redisClient.set("fearGreedIndex", fearGreed.toString(), 60 * 60);
        } catch (error) {
            logger.error("❌ Erro ao coletar dados globais no Scheduler:", error);
        }

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
