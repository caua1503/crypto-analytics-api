// Prisma config para o banco de dados de mercado (dados brutos: assets, snapshots, análises)
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
    schema: "prisma/market",
    migrations: {
        path: "prisma/market/migrations",
    },
    datasource: {
        url: process.env.MIGRATE_DB!,
    },
});
