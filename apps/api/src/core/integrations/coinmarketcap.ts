import { ServiceContract, ServiceConfig } from "./types.js";
import {
    ApiMarketSnapshotSchema,
    ApiMarketSnapshot,
    ApiMacroData,
    ApiMacroDataSchema,
} from "../../types/interfaces/integrations.interface.js";
import { SourceEnum } from "../../types/common.js";
import { AssetService } from "../../services/asset.service.js";
import { prisma } from "../../config/prisma.js";
import axios, { AxiosInstance } from "axios";

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
}
