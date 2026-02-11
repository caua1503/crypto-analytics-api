import type { ServiceContract, ServiceConfig } from "./types.js";
import { getDefaultCacheUntil } from "./common.js";
import { Period } from "@repo/shared/types/common";
import {
    ApiMarketSnapshotSchema,
    type ApiMarketSnapshot,
    type ApiMacroData,
    ApiMacroDataSchemaDTO,
    type ApiOHLC,
    ApiOHLCSchema,
} from "@repo/shared/types/interfaces/integrations.interface";
import { SourceEnum } from "@repo/shared/types/common";
import { AssetService } from "@repo/shared/services/asset.service";
import { prisma } from "@repo/shared";
import axios, { type AxiosInstance } from "axios";

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
        const queryApi = `${assetSymbol.toLowerCase()}-${assetName.toLowerCase().replace(" ", "-")}`;

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

        const queryApi = `${assetSymbol.toLowerCase()}-${assetName.toLowerCase().replace(" ", "-")}`;

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
    }

    async fetchOHLCBySymbol(assetSymbol: string): Promise<ApiOHLC> {
        const { name: assetName } = await new AssetService(prisma).findBySymbol(assetSymbol);
        const queryApi = `${assetSymbol.toLowerCase()}-${assetName.toLowerCase().replace(" ", "-")}`;

        const response = await this.httpsInterface
            .get(`/coins/${queryApi}/ohlcv/today`)
            .then((res) => res.data);

        const {
            open,
            high,
            low,
            close,
        } = response[0];

        const data = ApiOHLCSchema.parse({
            assetSymbol: assetSymbol.toUpperCase(),
            open,
            high,
            low,
            close,
            period: "24H"
        })

        return data;
    }

    async fetchOHLCById(assetId: number): Promise<ApiOHLC> {
        const { symbol: assetSymbol, name: assetName } = await new AssetService(prisma).findById(
            assetId,
        );

        const queryApi = `${assetSymbol.toLowerCase()}-${assetName.toLowerCase().replace(" ", "-")}`;

        const response = await this.httpsInterface
            .get(`/coins/${queryApi}/ohlcv/today`)
            .then((res) => res.data);

        const {
            open,
            high,
            low,
            close,
        } = response[0];

        const data = ApiOHLCSchema.parse({
            assetSymbol: assetSymbol.toUpperCase(),
            open,
            high,
            low,
            close,
            period: "24H"
        })

        return data;
    }
}
