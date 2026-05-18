import type {
	ApiMacroData,
	ApiMarketSnapshot,
	ApiOHLC,
} from "@repo/shared/types/interfaces/integrations.interface";
import type { ServiceConfig, ServiceContract } from "./types.js";

export class CoinMarketCapService implements ServiceContract {
	private apiKey?: string;
	private apiUrl: string;

	constructor(config: ServiceConfig) {
		this.apiKey = config.apiKey;
		this.apiUrl = config.apiUrl;
	}

	async fetchMarketDataBySymbol(assetSymbol: string): Promise<ApiMarketSnapshot> {
		assetSymbol;
		throw new Error("CoinMarketCapService not implemented yet");
	}

	async fetchMarketDataById(assetId: number): Promise<ApiMarketSnapshot> {
		assetId;
		throw new Error("CoinMarketCapService not implemented yet");
	}

	async fetchMacroData(): Promise<ApiMacroData> {
		throw new Error("CoinMarketCapService not implemented yet");
	}

	async fetchOHLCBySymbol(assetSymbol: string): Promise<ApiOHLC> {
		assetSymbol;
		throw new Error("CoinMarketCapService not implemented yet");
	}

	async fetchOHLCById(assetId: number): Promise<ApiOHLC> {
		assetId;
		throw new Error("CoinMarketCapService not implemented yet");
	}
}
