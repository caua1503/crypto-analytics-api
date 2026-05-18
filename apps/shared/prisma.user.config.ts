// Prisma config para o banco de dados de usuários (auth, sessões, api keys)
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
	schema: "prisma/user",
	migrations: {
		path: "prisma/user/migrations",
	},
	datasource: {
		url: process.env.MIGRATE_DB_USER ?? "",
	},
});
