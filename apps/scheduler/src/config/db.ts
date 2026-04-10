import { createMarketPrismaClient, type PrismaClient } from "@repo/shared";
import { env } from "./env";

const connectionString = env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

export const prisma = createMarketPrismaClient(connectionString);
export type PrismaClientType = PrismaClient;

