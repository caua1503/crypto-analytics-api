import { CoinGeckoService } from "./coingecko.js";
import { CoinPaprikaService } from "./coincaprika.js";
import { CoinMarketCapService } from "./coinmarketcap.js";
import { env } from "../../config/env.js";
import { SourceEnum } from "../../types/common.js";
import { ServiceContract, ServiceConfig, ServiceConstructor } from "./types.js";

const serviceRegistry: Record<SourceEnum, ServiceConstructor> = {
    [SourceEnum.COINGECKO]: CoinGeckoService,
    [SourceEnum.COINPAPRIKA]: CoinPaprikaService,
    [SourceEnum.COINMARKETCAP]: CoinMarketCapService,
};

// Singleton instance
let _serviceInstance: ServiceContract | null = null;

function verifyApiKey(apikey: string | undefined): string {
    if (!apikey) {
        throw new Error(`API key is required for this service ${env.MARKET_DATA_PROVIDER}`);
    }
    return apikey;
}

function createMarketDataService(
    provider: SourceEnum = env.MARKET_DATA_PROVIDER as SourceEnum,
): ServiceContract {
    const ServiceClass = serviceRegistry[provider];

    if (!ServiceClass) {
        throw new Error(`Unsupported market data provider: ${provider}`);
    }

    const configs: Record<SourceEnum, ServiceConfig> = {
        [SourceEnum.COINGECKO]: {
            apiUrl: env.COINGECKO_API_URL,
            apiKey: env.COINGECKO_API_KEY,
        },
        [SourceEnum.COINPAPRIKA]: {
            apiUrl: env.COINPAPRIKA_API_URL,
            apiKey: env.COINPAPRIKA_API_KEY,
        },
        [SourceEnum.COINMARKETCAP]: {
            apiUrl: env.COINMARKETCAP_API_URL,
            apiKey: env.COINMARKETCAP_API_KEY,
        },
    };

    const config = configs[provider];
    verifyApiKey(config.apiKey);

    return new ServiceClass(config);
}

export function getMarketDataService(): ServiceContract {
    if (!_serviceInstance) {
        _serviceInstance = createMarketDataService();
    }
    return _serviceInstance;
}
