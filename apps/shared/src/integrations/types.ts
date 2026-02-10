import type {
    ApiMarketSnapshot,
    ApiMacroData,
    ApiOHLC,
} from "@repo/shared/types/interfaces/integrations.interface";

export interface ServiceContract {
    fetchMarketDataBySymbol(assetSymbol: string): Promise<ApiMarketSnapshot>;
    fetchMarketDataById(assetId: number): Promise<ApiMarketSnapshot>;

    fetchMacroData(): Promise<ApiMacroData>;

    fetchOHLCBySymbol?(assetSymbol: string): Promise<ApiOHLC>;
    fetchOHLCById?(assetId: number): Promise<ApiOHLC>;
}

export interface ServiceConfig {
    apiUrl: string;
    apiKey?: string;
}

export type ServiceConstructor = new (config: ServiceConfig) => ServiceContract;
