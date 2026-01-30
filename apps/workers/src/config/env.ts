import {z} from "zod";
import "dotenv/config";

const EnvSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    REDIS_HOST: z.string().default("localhost"),
    REDIS_PORT: z.coerce.number().default(6379),
    DATABASE_URL: z.string(),
});


export const env = EnvSchema.parse(process.env);
export const redisConnection = {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
};