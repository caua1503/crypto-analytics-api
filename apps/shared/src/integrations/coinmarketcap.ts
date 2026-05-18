import { prisma } from "@repo/shared";
import { AssetService } from "@repo/shared/services/asset.service";
import { SourceEnum } from "@repo/shared/types/common";
import {
	type ApiMacroData,
	ApiMacroDataSchema,
	type ApiMarketSnapshot,
	ApiMarketSnapshotSchema,
	type ApiOHLC,
} from "@repo/shared/types/interfaces/integrations.interface";
import axios, { AxiosInstance } from "axios";
import type { ServiceConfig, ServiceContract } from "./types.js";

export class CoinMarketCapService implements ServiceContract {
	private apiKey?: string;
	private apiUrl: string;

	constructor(config: ServiceConfig) {
		this.apiKey = config.apiKey;
		this.apiUrl = config.apiUrl;
	}

	async fetchMarketDataBySymbol(assetSymbol: string): Promise<ApiMarketSnapshot> {
		throw new Error("CoinMarketCapService not implemented yet");
	}

	async fetchMarketDataById(assetId: number): Promise<ApiMarketSnapshot> {
		throw new Error("CoinMarketCapService not implemented yet");
	}

	async fetchMacroData(): Promise<ApiMacroData> {
		throw new Error("CoinMarketCapService not implemented yet");
	}

	async fetchOHLCBySymbol(assetSymbol: string): Promise<ApiOHLC> {
		throw new Error("CoinMarketCapService not implemented yet");
	}

	async fetchOHLCById(assetId: number): Promise<ApiOHLC> {
		throw new Error("CoinMarketCapService not implemented yet");
	}
}
