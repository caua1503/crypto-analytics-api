import { ApiMarketSnapshot, ApiMacroData } from "../../types/interfaces/integrations.interface.js";

export interface ServiceContract {
    fetchMarketDataBySymbol(assetSymbol: string): Promise<ApiMarketSnapshot>;
    fetchMarketDataById(assetId: number): Promise<ApiMarketSnapshot>;
    fetchMacroData(): Promise<ApiMacroData>;
}

export interface ServiceConfig {
    apiUrl: string;
    apiKey?: string;
}

export type ServiceConstructor = new (config: ServiceConfig) => ServiceContract;
