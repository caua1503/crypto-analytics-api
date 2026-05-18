import { prisma } from "@repo/shared";
import { AssetService } from "@repo/shared/services/asset.service";
import { SourceEnum } from "@repo/shared/types/common";
import {
	type ApiMacroData,
	ApiMacroDataSchemaDTO,
	type ApiMarketSnapshot,
	ApiMarketSnapshotSchema,
	type ApiOHLC,
} from "@repo/shared/types/interfaces/integrations.interface";
import axios, { type AxiosInstance } from "axios";
import { getDefaultCacheUntil } from "./common.js";
import type { ServiceConfig, ServiceContract } from "./types.js";

export class CoinGeckoService implements ServiceContract {
	private apiKey?: string;
	private apiUrl: string;

	private httpsInterface: AxiosInstance;

	constructor(config: ServiceConfig) {
		this.apiKey = config.apiKey;
		this.apiUrl = config.apiUrl;

		this.httpsInterface = axios.create({
			baseURL: this.apiUrl,
			headers: this.apiKey ? { "x-cg-demo-api-key": this.apiKey } : undefined,
		});
	}

	async fetchMarketDataBySymbol(assetSymbol: string): Promise<ApiMarketSnapshot> {
		const { name: assetName } = await new AssetService(prisma).findBySymbol(assetSymbol);
		const response = await this.httpsInterface
			.get("coins/markets", {
				params: {
					vs_currency: "usd",
					ids: assetName.toLowerCase(),
				},
			})
			.then((res) => res.data);

		const { symbol, current_price, total_volume, market_cap } = response[0];

		const data = ApiMarketSnapshotSchema.parse({
			assetSymbol: symbol.toUpperCase(),
			priceUsd: current_price,
			volume24hUsd: total_volume,
			marketCapUsd: market_cap,
			source: SourceEnum.COINGECKO,
			fetchedAt: new Date(),
			cachedUntil: getDefaultCacheUntil(),
		});
		// console.log(data);
		return data;
	}

	async fetchMarketDataById(assetId: number): Promise<ApiMarketSnapshot> {
		const { name: assetName } = await new AssetService(prisma).findById(assetId);
		const response = await this.httpsInterface
			.get("coins/markets", {
				params: {
					vs_currency: "usd",
					ids: assetName.toLowerCase(),
				},
			})
			.then((res) => res.data);

		const { symbol, current_price, total_volume, market_cap } = response[0];

		const data = ApiMarketSnapshotSchema.parse({
			assetSymbol: symbol.toUpperCase(),
			priceUsd: current_price,
			volume24hUsd: total_volume,
			marketCapUsd: market_cap,
			source: SourceEnum.COINGECKO,
			fetchedAt: new Date(),
			cachedUntil: getDefaultCacheUntil(),
		});
		// console.log(data);
		return data;
	}

	async fetchMacroData(): Promise<ApiMacroData> {
		const response = await this.httpsInterface.get("global").then((res) => res.data);

		const {
			market_cap_percentage: { btc: btcDominance },
			total_market_cap: { usd: totalMarketCapUsd },
			total_volume: { usd: totalVolumeUsd },
		} = response.data;

		const liquidityIndex = (totalVolumeUsd / totalMarketCapUsd) * 100;

		// console.log("Bitcoin Dominance:", btcDominance);
		// console.log("Total Market Cap (USD):", totalMarketCapUsd);
		// console.log("Total Volume (USD):", totalVolumeUsd);
		// console.log("Liquidity Index (%):", liquidityIndex.toFixed(2));

		const data = ApiMacroDataSchemaDTO.parse({
			btcDominance,
			totalMarketCapUsd,
			liquidityIndex,
			source: SourceEnum.COINGECKO,
			timestamp: new Date(),
		});

		return data;
	}

	async fetchOHLCBySymbol(assetSymbol: string): Promise<ApiOHLC> {
		assetSymbol;
		throw new Error("CoinGeckoService not implemented yet");
	}

	async fetchOHLCById(assetId: number): Promise<ApiOHLC> {
		assetId;
		throw new Error("CoinGeckoService not implemented yet");
	}
}

// const result = await new CoinGeckoService({apiUrl: env.COINGECKO_API_URL, apiKey: env.COINGECKO_API_KEY}).fetchMacroData()
// console.log("Macro Data CoinGecko:", result);
