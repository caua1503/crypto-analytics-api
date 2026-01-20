import { z } from "zod";
import "dotenv/config";

export const EnvConfigSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    HOST: z.string().default("0.0.0.0"),
    PORT: z.coerce.number().default(3000),

    DATABASE_URL: z.string().min(1),
    REDIS_URL: z.string().min(1),

    MARKET_DATA_PROVIDER: z
        .enum(["COINGECKO", "COINMARKETCAP", "COINPAPRIKA"])
        .default("COINPAPRIKA"),

    COINGECKO_API_URL: z.url().default("https://api.coingecko.com/api/v3"),
    COINGECKO_API_KEY: z.string().optional(),

    COINMARKETCAP_API_URL: z.url().default("https://pro-api.coinmarketcap.com"),
    COINMARKETCAP_API_KEY: z.string().optional(),

    COINPAPRIKA_API_URL: z.url().default("https://api.coinpaprika.com/v1"),
    COINPAPRIKA_API_KEY: z.string().default("no-key"),

    // JWT_SECRET: z.string().min(256),
});
export const env = EnvConfigSchema.parse(process.env);
