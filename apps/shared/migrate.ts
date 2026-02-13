#!/usr/bin/env bun
import { spawnSync } from "node:child_process";

console.log("Iniciando migrações do banco de dados...");

// Executar migrações
const result = spawnSync("bunx", ["prisma", "migrate", "deploy"], {
    stdio: "inherit",
    shell: true,
});

if (result.status !== 0) {
    console.error("Erro ao aplicar migrações");
    process.exit(1);
}

console.log("Migrações aplicadas com sucesso!");
process.exit(0);
