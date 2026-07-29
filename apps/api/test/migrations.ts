import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const sharedDir = resolve(import.meta.dir, "../../shared");

export function runPrismaMigrations() {
	const marketResult = spawnSync("bunx", ["prisma", "migrate", "deploy"], {
		cwd: sharedDir,
		env: process.env,
		stdio: "inherit",
	});

	if (marketResult.status !== 0) {
		throw new Error("Failed to apply market database migrations");
	}

	const userResult = spawnSync(
		"bunx",
		["prisma", "migrate", "deploy", "--config=prisma.user.config.ts"],
		{
			cwd: sharedDir,
			env: process.env,
			stdio: "inherit",
		},
	);

	if (userResult.status !== 0) {
		throw new Error("Failed to apply user database migrations");
	}
}
