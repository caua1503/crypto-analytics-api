import "dotenv/config";
import { EnvConfigSchema } from "../types/interfaces/config.interface.js";

export const env = EnvConfigSchema.parse(process.env);
