#!/usr/bin/env bun
import "dotenv/config"; // Carregar variáveis de ambiente primeiro
import { spawnSync } from "node:child_process";

console.log("Iniciando migrações do banco de dados...");

// Executar migrações
console.log(process.env.DATABASE_URL)
const result = spawnSync("bunx", ["prisma", "migrate", "deploy"], {
    stdio: "inherit",
    shell: true,
    env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL, // Garantir que está disponível
    },
});

if (result.status !== 0) {
    console.error("Erro ao aplicar migrações");
    process.exit(1);
}

console.log("Migrações aplicadas com sucesso!");
process.exit(0);
