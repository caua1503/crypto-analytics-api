import axios, { AxiosInstance } from 'axios';
import { env } from '../config/env.js';
import { ApiMarketSnapshotSchema } from '../types/interfaces/integrations.interface.js';
import { symbol } from 'zod';

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

  constructor(
    apiUrl: string = env.COINGECKO_API_URL,
    apiKey: string = env.COINGECKO_API_KEY,
    
  ) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;

    this.httpsInterface = axios.create({
      baseURL: this.apiUrl,
      headers: this.apiKey
        ? { 'x-cg-pro-api-key': this.apiKey }
        : undefined,
    });
  }

  async fetchMarketData(assetIdentifier: string): Promise<any> {
    const response = await this.httpsInterface
    .get("coins/markets", {
        params: {
          vs_currency: "usd",
          ids: assetIdentifier,
        },
      }
    )
    .then(res => res.data);
    const {symbol, current_price, total_volume, market_cap } = response[0];
    console.log(current_price);
    const data = ApiMarketSnapshotSchema.parse({
        assetSymbol: symbol.toUpperCase(),
        priceUsd: current_price,
        volume24hUsd: total_volume,
        marketCapUsd: market_cap,
        source: "CoinGecko",
        fetchedAt: new Date(),
        cachedUntil: new Date(Date.now() + 5 * 60 * 1000), // Cache por 5 minutos
    }
  );
    console.log(data);
    return {}
  }
}

