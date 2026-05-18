import { Logger, prisma, RedisClient } from "@repo/shared";
import { FearAndGreedIndex, getMarketDataService } from "@repo/shared/integrations";
import { AnalysisService } from "@repo/shared/services/analysis.service";

import { MarketSnapshotService } from "@repo/shared/services/market.service";
import {
	type ApiMacroData,
	ApiMacroDataSchema,
	type ApiOHLC,
} from "@repo/shared/types/interfaces/integrations.interface";
import { Worker } from "bullmq";
import { env, redisConnection } from "./config/env.js";

const QUEUE_NAME = "processing-queue";
const logger = new Logger("Worker");

const marketSnapshotService = new MarketSnapshotService(prisma);
const analysisService = new AnalysisService(prisma);
const marketDataIntegration = getMarketDataService();

const redisClient = new RedisClient();

let cachedMacroData: ApiMacroData | null = null;
let cachedFearGreed: number | null = null;
let lastGlobalDataFetch = 0;
const GLOBAL_DATA_TTL = 60 * 60 * 1000; // 1 hora

async function getGlobalMarketData() {
	const now = Date.now();
	const isCacheExpired = now - lastGlobalDataFetch > GLOBAL_DATA_TTL;

	if (!cachedMacroData || !cachedFearGreed || isCacheExpired) {
		const macroData = await redisClient.get_json<ApiMacroData>("macroData", ApiMacroDataSchema);

		const fearGreedRaw = await redisClient.get("fearGreedIndex");
		const fearGreed = fearGreedRaw ? Number.parseInt(fearGreedRaw, 10) : null;

		if (!macroData || fearGreed === null) {
			logger.log("⚠️ Dados globais ausentes no Redis, tentando coletar como fallback...");

			const newMacroData = macroData || (await marketDataIntegration.fetchMacroData());
			const newFearGreed = fearGreed ?? (await new FearAndGreedIndex().getIndexValue());

			if (!macroData) await redisClient.set_json("macroData", newMacroData, 60 * 60);
			if (fearGreed === null)
				await redisClient.set("fearGreedIndex", newFearGreed.toString(), 60 * 60);

			cachedMacroData = newMacroData;
			cachedFearGreed = newFearGreed;
		} else {
			cachedMacroData = macroData;
			cachedFearGreed = fearGreed;
		}

		lastGlobalDataFetch = now;
	}

	if (!cachedMacroData || cachedFearGreed === null) {
		throw new Error("Failed to fetch global market data");
	}

	return {
		macroData: cachedMacroData,
		fearGreed: cachedFearGreed,
	};
}

new Worker(
	QUEUE_NAME,
	async (job) => {
		if (job.name !== "process-heavy") return;

		const assets = job.data;
		logger.log(`📦 Processando lote com ${assets.length} ativos...`);

		for (const asset of assets) {
			logger.log(`⚙️ Processando ativo: ${asset.symbol} (${asset.id})`);

			try {
				// logger.log(`[${asset.symbol}] Coletando dados de mercado...`);
				const marketData = await marketDataIntegration.fetchMarketDataBySymbol(
					asset.symbol,
				);

				const { macroData, fearGreed } = await getGlobalMarketData();

				let ohlcData: ApiOHLC | undefined;
				try {
					// logger.log(`[${asset.symbol}] Coletando dados OHLC...`);
					ohlcData = await marketDataIntegration.fetchOHLCBySymbol(asset.symbol);
				} catch (error) {
					logger.error(
						`[${asset.symbol}] Falha ao coletar OHLC (continuando sem): ${error}`,
					);
				}

				// logger.log(`[${asset.symbol}] Criando snapshot no banco...`);

				const snapshot = await marketSnapshotService.create({
					assetId: asset.id,
					priceUsd: marketData.priceUsd,
					volume24hUsd: marketData.volume24hUsd,
					marketCapUsd: marketData.marketCapUsd,
					btcDominance: macroData.btcDominance,
					fearGreed,
					source: marketData.source,
					cachedUntil: marketData.cachedUntil,
					open: ohlcData?.open,
					high: ohlcData?.high,
					low: ohlcData?.low,
					close: ohlcData?.close,
				});

				// logger.log(
				//     `[${asset.symbol}] Executando motor de análise (ID Snapshot: ${snapshot.id})...`,
				// );
				const analysis = await analysisService.performAnalysis(asset.id, snapshot.id);

				logger.log(
					`Finalizado [${asset.symbol}]: Recomendação = ${analysis.recommendation} (Score: ${analysis.finalScore})`,
				);
			} catch (error) {
				logger.error(`Erro ao processar ativo ${asset.symbol}:`, error);
			}
		}
	},
	{
		connection: redisConnection,
		concurrency: env.WORKER_CONCURRENCY,
	},
);

console.log(`👷 Worker rodando (concurrency: ${env.WORKER_CONCURRENCY})`);
