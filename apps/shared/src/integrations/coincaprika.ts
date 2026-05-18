import { prisma } from "@repo/shared";
import { AssetService } from "@repo/shared/services/asset.service";
import { Period, SourceEnum } from "@repo/shared/types/common";
import {
	type ApiMacroData,
	ApiMacroDataSchemaDTO,
	type ApiMarketSnapshot,
	ApiMarketSnapshotSchema,
	type ApiOHLC,
	ApiOHLCSchema,
} from "@repo/shared/types/interfaces/integrations.interface";
import axios, { type AxiosInstance } from "axios";
import { getDefaultCacheUntil } from "./common.js";
import type { ServiceConfig, ServiceContract } from "./types.js";

export class CoinPaprikaService implements ServiceContract {
	private apiKey?: string;
	private apiUrl: string;

	private httpsInterface: AxiosInstance;

	constructor(config: ServiceConfig) {
		this.apiKey = config.apiKey;
		this.apiUrl = config.apiUrl;

		this.httpsInterface = axios.create({
			baseURL: this.apiUrl,
			// freee nao necessita de api key
			// headers: this.apiKey ? { "x-cg-demo-api-key": this.apiKey } : undefined,
		});
	}

	async fetchMarketDataBySymbol(assetSymbol: string): Promise<ApiMarketSnapshot> {
		try {
			const { name: assetName } = await new AssetService(prisma).findBySymbol(assetSymbol);
			const queryApi = `${assetSymbol.toLowerCase()}-${assetName.toLowerCase().replace(" ", "-")}`;

			const response = await this.httpsInterface
				.get(`/tickers/${queryApi}`)
				.then((res) => res.data);

			const {
				price: current_price,
				volume_24h: total_volume,
				market_cap,
			} = response.quotes.USD;

			const data = ApiMarketSnapshotSchema.parse({
				assetSymbol: assetSymbol.toUpperCase(),
				priceUsd: current_price,
				volume24hUsd: total_volume,
				marketCapUsd: market_cap,
				source: SourceEnum.COINPAPRIKA,
				fetchedAt: new Date(),
				cachedUntil: getDefaultCacheUntil(),
			});

			return data;
		} catch (error: any) {
			throw new Error(
				`Erro ao buscar dados de mercado para ${assetSymbol}: ${error.message}`,
			);
		}
	}

	async fetchMarketDataById(assetId: number): Promise<ApiMarketSnapshot> {
		try {
			const { symbol: assetSymbol, name: assetName } = await new AssetService(
				prisma,
			).findById(assetId);

			const queryApi = `${assetSymbol.toLowerCase()}-${assetName.toLowerCase().replace(" ", "-")}`;

			const response = await this.httpsInterface
				.get(`/tickers/${queryApi}`)
				.then((res) => res.data);

			const {
				price: current_price,
				volume_24h: total_volume,
				market_cap,
			} = response.quotes.USD;

			const data = ApiMarketSnapshotSchema.parse({
				assetSymbol: assetSymbol.toUpperCase(),
				priceUsd: current_price,
				volume24hUsd: total_volume,
				marketCapUsd: market_cap,
				source: SourceEnum.COINPAPRIKA,
				fetchedAt: new Date(),
				cachedUntil: getDefaultCacheUntil(),
			});

			return data;
		} catch (error: any) {
			throw new Error(`Erro ao buscar dados de mercado para ID ${assetId}: ${error.message}`);
		}
	}

	async fetchMacroData(): Promise<ApiMacroData> {
		try {
			const response = await this.httpsInterface.get(`/global`).then((res) => res.data);

			const {
				bitcoin_dominance_percentage: btcDominance,
				market_cap_usd: totalMarketCapUsd,
				volume_24h_usd: totalVolumeUsd,
			} = response;

			const liquidityIndex = (totalVolumeUsd / totalMarketCapUsd) * 100;

			const data = ApiMacroDataSchemaDTO.parse({
				btcDominance: btcDominance,
				totalMarketCapUsd: totalMarketCapUsd,
				liquidityIndex: liquidityIndex,
				source: SourceEnum.COINPAPRIKA,
				timestamp: new Date(),
			});

			return data;
		} catch (error: any) {
			throw new Error(`Erro ao buscar dados macroeconômicos: ${error.message}`);
		}
	}

	async fetchOHLCBySymbol(assetSymbol: string): Promise<ApiOHLC> {
		try {
			const { name: assetName } = await new AssetService(prisma).findBySymbol(assetSymbol);
			const queryApi = `${assetSymbol.toLowerCase()}-${assetName.toLowerCase().replace(" ", "-")}`;

			const response = await this.httpsInterface
				.get(`/coins/${queryApi}/ohlcv/today`)
				.then((res) => res.data);

			const { open, high, low, close } = response[0];

			const data = ApiOHLCSchema.parse({
				assetSymbol: assetSymbol.toUpperCase(),
				open,
				high,
				low,
				close,
				period: "24H",
			});

			return data;
		} catch (error: any) {
			throw new Error(`Erro ao buscar OHLC para ${assetSymbol}: ${error.message}`);
		}
	}

	async fetchOHLCById(assetId: number): Promise<ApiOHLC> {
		try {
			const { symbol: assetSymbol, name: assetName } = await new AssetService(
				prisma,
			).findById(assetId);

			const queryApi = `${assetSymbol.toLowerCase()}-${assetName.toLowerCase().replace(" ", "-")}`;

			const response = await this.httpsInterface
				.get(`/coins/${queryApi}/ohlcv/today`)
				.then((res) => res.data);

			const { open, high, low, close } = response[0];

			const data = ApiOHLCSchema.parse({
				assetSymbol: assetSymbol.toUpperCase(),
				open,
				high,
				low,
				close,
				period: "24H",
			});

			return data;
		} catch (error: any) {
			throw new Error(`Erro ao buscar OHLC para ID ${assetId}: ${error.message}`);
		}
	}
}
