import { createPrismaClient, type PrismaClient } from "@repo/shared";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
}
const globalForPrisma = globalThis as unknown as {
    prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient(connectionString, {
    max: 20,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 3_000,
});

if (process.env.RUN_MODE !== "production") {
    globalForPrisma.prisma = prisma;
}

export type PrismaClientType = PrismaClient;

