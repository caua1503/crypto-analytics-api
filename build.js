import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import {
	existsSync,
	mkdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { platform } from "node:os";
import { join } from "node:path";

const apps = ["shared", "api", "scheduler", "workers"];
const shouldClean = process.argv.includes("--clean");
const docker = process.argv.includes("--docker");
const generateJwt = process.argv.includes("--jwt");
const buildDir = join(import.meta.dirname, "dist");

if (generateJwt) {
	console.log("Generating secure JWT secrets...");
	const newAccessSecret = randomBytes(32).toString("hex");
	const newRefreshSecret = randomBytes(32).toString("hex");
	const composePath = join(import.meta.dirname, "docker-compose.yml");
	if (existsSync(composePath)) {
		let composeContent = readFileSync(composePath, "utf8");
		composeContent = composeContent.replace(
			/JWT_ACCESS_SECRET=.*/g,
			`JWT_ACCESS_SECRET=${newAccessSecret}`,
		);
		composeContent = composeContent.replace(
			/JWT_REFRESH_SECRET=.*/g,
			`JWT_REFRESH_SECRET=${newRefreshSecret}`,
		);
		writeFileSync(composePath, composeContent, "utf8");
		console.log("JWT secrets updated successfully in docker-compose.yml!");
	} else {
		console.error("docker-compose.yml not found!");
		process.exit(1);
	}
}

if (!existsSync(buildDir)) {
	mkdirSync(buildDir);
	console.log(`Created build directory: ${buildDir}`);
}

const isWindows = platform() === "win32";

const target = "bun-linux-x64-musl";
const isWindowsTarget = target.includes("windows");

for (const app of apps) {
	const appPath = join(import.meta.dirname, "apps", app);
	const fileName = isWindowsTarget ? `${app}.exe` : app;
	const outfile = join(buildDir, fileName);

	console.log(`Installing dependencies for ${app}...`);
	const installResult = spawnSync("bun", ["install"], {
		cwd: appPath,
		stdio: "inherit",
		shell: true,
	});

	if (installResult.status !== 0) {
		console.error(`Error installing dependencies for ${app}`);
		process.exit(1);
	}

	const lintResult = spawnSync("bun", ["run", "lint"], {
		cwd: appPath,
		stdio: "inherit",
		shell: true,
	});

	if (lintResult.status !== 0) {
		console.error(`Error linting ${app}`);
		process.exit(1);
	}

	console.log(`Building ${app}...`);

	// Definir entry point baseado no app
	const entryPoint = app === "shared" ? "migrate.ts" : "src/index.ts";

	const result = spawnSync(
		"bun",
		[
			"build",
			"--compile",
			"--minify",
			"--bytecode",
			// "--sourcemap",
			`--target=${target}`,
			entryPoint,
			"--outfile",
			outfile,
		],
		{
			cwd: appPath,
			stdio: "inherit",
			shell: isWindows,
		},
	);

	if (result.status !== 0) {
		console.error(`Error building ${app}`);
		process.exit(1);
	}

	console.log(`Successfully built ${app} to ${outfile}`);
}

if (shouldClean) {
	console.log("\nCleaning up node_modules for all apps...");
	for (const app of apps) {
		const appPath = join(import.meta.dirname, "apps", app);
		const nmPath = join(appPath, "node_modules");
		if (existsSync(nmPath)) {
			console.log(`Removing node_modules for ${app}...`);
			rmSync(nmPath, { recursive: true, force: true });
		}
	}
}

if (docker) {
	console.log("\nBuilding Docker images...");
	const dockerResult = spawnSync("docker", ["compose", "up", "--build", "-d"], {
		cwd: import.meta.dirname,
		stdio: "inherit",
		shell: true,
	});
	if (dockerResult.status !== 0) {
		console.error("Error building Docker images");
		process.exit(1);
	}
	console.log("Docker images built successfully!");
}

console.log("\nAll builds completed successfully!");
