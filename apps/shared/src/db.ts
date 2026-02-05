import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { env } from "@repo/shared/env";

const connectionString = env.DATABASE_URL;

export const createPrismaClient = (connectionString: string, poolConfig?: ConstructorParameters<typeof Pool>[0]) => {
    const pool = new Pool({ connectionString, ...poolConfig });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
};

const globalForPrisma = globalThis as unknown as {
    prisma?: PrismaClient;
};

export const prisma =
    globalForPrisma.prisma ??
    createPrismaClient(connectionString, {
        max: 20,
        idleTimeoutMillis: 10_000,
        connectionTimeoutMillis: 3_000,
    });

if (env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
export type PrismaClientType = PrismaClient;
export * from "../generated/prisma/client.js";