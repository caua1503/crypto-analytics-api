#!/usr/bin/env bun
import "dotenv/config"; // Carregar variáveis de ambiente primeiro
import { spawnSync } from "node:child_process";

console.log("Iniciando migrações do banco de dados...");

console.log(`DATABASE_URL: ${process.env.DATABASE_URL}`);

const marketResult = spawnSync("bunx", ["prisma", "migrate", "deploy"], {
	stdio: "inherit",
	shell: true,
	env: {
		...process.env,
		MIGRATE_DB: process.env.DATABASE_URL || process.env.MIGRATE_DB,
	},
});

if (marketResult.status !== 0) {
	console.error("Erro ao aplicar migrações do banco de mercado");
	process.exit(1);
}

console.log("Migrações do banco de mercado aplicadas com sucesso!");

console.log(`USER_DATABASE_URL: ${process.env.USER_DATABASE_URL}`);

const userResult = spawnSync(
	"bunx",
	["prisma", "migrate", "deploy", "--config=prisma.user.config.ts"],
	{
		stdio: "inherit",
		shell: true,
		env: {
			...process.env,
			USER_DATABASE_URL: process.env.USER_DATABASE_URL,
			MIGRATE_DB_USER: process.env.USER_DATABASE_URL || process.env.MIGRATE_DB_USER,
		},
	},
);

if (userResult.status !== 0) {
	console.error("Erro ao aplicar migrações do banco de usuários");
	process.exit(1);
}

console.log("Migrações do banco de usuários aplicadas com sucesso!");
process.exit(0);
