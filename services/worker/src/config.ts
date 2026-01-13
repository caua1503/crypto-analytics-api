import { z } from "zod";
import "dotenv/config";

export const EnvConfigSchema = z.object({
  REDIS_HOST: z.string().default("0.0.0.0"),
  REDIS_PORT: z.coerce.number().default(3000),
});

export const env = EnvConfigSchema.parse(process.env);
