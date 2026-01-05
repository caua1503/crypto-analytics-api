import z from "zod";

export const EnvConfigSchema = z.object({
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().default(3000),

  COINGECKO_API_URL: z.string().url().default("https://api.coingecko.com/api/v3/"),
  COINGECKO_API_KEY: z.string().optional(),

  COINMARKETCAP_API_URL: z.string().url().default("https://pro-api.coinmarketcap.com/v1/"),
  COINMARKETCAP_API_KEY: z.string(),

  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().default("redis://localhost:6379"),

});