import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

export const createPrismaClient = (connectionString: string, poolConfig?: ConstructorParameters<typeof Pool>[0]) => {
    const pool = new Pool({ connectionString, ...poolConfig });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
};

export type { PrismaClient } from "../generated/prisma/client.js";
export * from "../generated/prisma/client.js";