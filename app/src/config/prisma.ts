import { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const pool = new Pool({ 
  connectionString,
  max: 20,              
  idleTimeoutMillis: 30_000, 
  connectionTimeoutMillis: 2_000, 
  keepAlive: true,     
});

const adapter = new PrismaPg(pool);

export const prisma = 
  globalForPrisma.prisma ?? 
  new PrismaClient({ adapter });


if (process.env.RUN_MODE !== "production") {
  console.log(process.env.RUN_MODE);
  globalForPrisma.prisma = prisma;
}




export type PrismaClientType = PrismaClient;