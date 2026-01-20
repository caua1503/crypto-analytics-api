import { ServiceContract, ServiceConfig } from "./types.js";
import { env } from "../../config/env.js";
import { getDefaultCacheUntil } from "./common.js";
import {
    ApiMarketSnapshotSchema,
    ApiMarketSnapshot,
    ApiMacroData,
    ApiMacroDataSchema,
    ApiMacroDataSchemaDTO,
} from "../../types/interfaces/integrations.interface.js";
import { SourceEnum } from "../../types/common.js";
import { AssetService } from "../../services/asset.service.js";
import { prisma } from "../../config/prisma.js";
import axios, { AxiosInstance } from "axios";

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
        const { name: assetName } = await new AssetService(prisma).findBySymbol(assetSymbol);
        const queryApi = `${assetSymbol.toLowerCase()}-${assetName.toLowerCase()}`;

        const response = await this.httpsInterface
            .get(`/tickers/${queryApi}`)
            .then((res) => res.data);

        const {
            price: current_price,
            volume_24h: total_volume,
            market_cap: market_cap,
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
    }

    async fetchMarketDataById(assetId: number): Promise<ApiMarketSnapshot> {
        const { symbol: assetSymbol, name: assetName } = await new AssetService(prisma).findById(
            assetId,
        );

        const queryApi = `${assetSymbol.toLowerCase()}-${assetName.toLowerCase()}`;

        const response = await this.httpsInterface
            .get(`/tickers/${queryApi}`)
            .then((res) => res.data);

        const {
            price: current_price,
            volume_24h: total_volume,
            market_cap: market_cap,
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
    }

    async fetchMacroData(): Promise<ApiMacroData> {
        const response = await this.httpsInterface
            .get(`/global`)
            .then((res) => res.data);

        const { bitcoin_dominance_percentage: btcDominance, market_cap_usd: totalMarketCapUsd, volume_24h_usd: totalVolumeUsd } = response;

        const liquidityIndex = (totalVolumeUsd / totalMarketCapUsd) * 100;

        const data = ApiMacroDataSchemaDTO.parse({
            btcDominance: btcDominance,
            totalMarketCapUsd: totalMarketCapUsd,
            liquidityIndex: liquidityIndex,
            source: SourceEnum.COINPAPRIKA,
            timestamp: new Date(),
        });

        return data;
    }
}


// const result = await new CoinPaprikaService({apiUrl: env.COINPAPRIKA_API_URL, apiKey: env.COINPAPRIKA_API_KEY}).fetchMacroData()
// console.log("Macro Data CoinPaprika:", result);