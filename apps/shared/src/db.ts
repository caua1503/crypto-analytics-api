import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaClient as UserPrismaClient } from "../generated/user-prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { env } from "@repo/shared/env";

export const createMarketPrismaClient = (
    connectionString: string,
    poolConfig?: ConstructorParameters<typeof Pool>[0],
) => {
    const pool = new Pool({ connectionString, ...poolConfig });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
};

const globalForPrisma = globalThis as unknown as {
    prisma?: PrismaClient;
    userPrisma?: UserPrismaClient;
};

export const prisma =
    globalForPrisma.prisma ??
    createMarketPrismaClient(env.DATABASE_URL, {
        max: 20,
        idleTimeoutMillis: 10_000,
        connectionTimeoutMillis: 3_000,
    });

export const createUserPrismaClient = (
    connectionString: string,
    poolConfig?: ConstructorParameters<typeof Pool>[0],
) => {
    const pool = new Pool({ connectionString, ...poolConfig });
    const adapter = new PrismaPg(pool);
    return new UserPrismaClient({ adapter });
};

export const userPrisma =
    globalForPrisma.userPrisma ??
    createUserPrismaClient(env.USER_DATABASE_URL, {
        max: 10,
        idleTimeoutMillis: 10_000,
        connectionTimeoutMillis: 3_000,
    });

if (env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
    globalForPrisma.userPrisma = userPrisma;
}

export type PrismaClientType = PrismaClient;
export type UserPrismaClientType = UserPrismaClient;

export * from "../generated/prisma/client.js";
