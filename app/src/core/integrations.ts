import axios, { AxiosInstance } from "axios";
import { env } from "../config/env.js";
import {
    ApiMarketSnapshotSchema,
    ApiMarketSnapshot,
    ApiMacroDataSchema,
} from "../types/interfaces/integrations.interface.js";
import { symbol } from "zod";
import { SourceEnum } from "../types/common.js";
import { resolve } from "node:dns";

export class CoinMarketCapService {
    private apiKey: string;
    private apiUrl?: string;

    constructor(apiKey: string, apiUrl: string = env.COINMARKETCAP_API_URL) {
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
    }
}

export class CoinGeckoService {
    private apiKey?: string;
    private apiUrl: string;

    private httpsInterface: AxiosInstance;

    constructor(apiUrl: string = env.COINGECKO_API_URL, apiKey: string = env.COINGECKO_API_KEY) {
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;

        this.httpsInterface = axios.create({
            baseURL: this.apiUrl,
            headers: this.apiKey ? { "x-cg-demo-api-key": this.apiKey } : undefined,
        });
    }

    async fetchMarketData(assetIdentifier: string): Promise<ApiMarketSnapshot> {
        const response = await this.httpsInterface
            .get("coins/markets", {
                params: {
                    vs_currency: "usd",
                    ids: assetIdentifier,
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
            cachedUntil: new Date(Date.now() + 5 * 60 * 1000), // Cache por 5 minutos
        });
        // console.log(data);
        return data;
    }

    async fetchMacroData() {
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

        const data = ApiMacroDataSchema.parse({
            btcDominance,
            totalMarketCapUsd,
            liquidityIndex,
            source: SourceEnum.COINGECKO,
            timestamp: new Date(),
        });

        return data;
    }
}
