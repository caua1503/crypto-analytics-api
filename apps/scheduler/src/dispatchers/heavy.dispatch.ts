import { Logger, RedisClient } from "@repo/shared";
import {
	FearAndGreedIndex,
	getMarketDataService,
} from "@repo/shared/integrations";
import { Worker } from "bullmq";
import { prisma } from "../config/db";
import { env, redisConnection } from "../config/env";
import { dispatchQueue, processingQueue } from "../queues/processing.queue";

const marketDataIntegration = getMarketDataService();
const fearGreedService = new FearAndGreedIndex();
const redisClient = new RedisClient();

export const heavyDispatcher = new Worker(
	dispatchQueue.name,
	async (job) => {
		const logger = new Logger("HeavyDispatcher");

		if (job.name !== "dispatch-heavy") return;

		logger.log("🚀 Iniciando dispatch de mercado...");

		try {
			logger.log(
				"🌐 Coletando e semeando dados globais (Macro + Fear & Greed)...",
			);
			const macroData = await marketDataIntegration.fetchMacroData();
			// console.log("MacroData", macroData);
			const fearGreed = await fearGreedService.getIndexValue();
			// console.log("FearGreed", fearGreed);

			await redisClient.set_json("macroData", macroData, 60 * 60); // 1 hora
			await redisClient.set("fearGreedIndex", fearGreed.toString(), 60 * 60);
		} catch {
			logger.error("❌ Erro ao coletar dados globais no Scheduler:", error);
		}

		const assets = await prisma.asset.findMany({});

		// Chunk assets based on batch size
		const batchSize = env.BATCH_SIZE;
		const chunks = [];
		for (let i = 0; i < assets.length; i += batchSize) {
			chunks.push(assets.slice(i, i + batchSize));
		}

		logger.log(
			`Dispatching ${assets.length} assets in ${chunks.length} batches (Size: ${batchSize})`,
		);

		await processingQueue.addBulk(
			chunks.map((batch, index) => ({
				name: "process-heavy",
				data: batch,
				opts: {
					jobId: `batch-${Date.now()}-${index}`, // Optional: helps with tracking
				},
			})),
		);
	},
	{ connection: redisConnection },
);
