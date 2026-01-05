import { z } from "zod";

export const EnvConfigSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    HOST: z.string().default("0.0.0.0"),
    PORT: z.coerce.number().default(3000),

    DATABASE_URL: z.string().min(1),
    REDIS_URL: z.string().min(1),

    COINGECKO_API_URL: z.url().default("https://api.coingecko.com/api/v3"),
    COINGECKO_API_KEY: z.string().default("your-default-coingecko-api-key"),

    COINMARKETCAP_API_URL: z.url().default("https://pro-api.coinmarketcap.com"),
    COINMARKETCAP_API_KEY: z.string().default("your-default-cmc-api-key"),

});

export type EnvConfig = z.infer<typeof EnvConfigSchema>;

