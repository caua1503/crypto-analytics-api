import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { platform } from "node:os";

const apps = ["shared", "api", "scheduler", "workers"];
const shouldClean = process.argv.includes("--clean");
const buildDir = join(import.meta.dirname, "build");

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
            "--sourcemap",
            `--target=${target}`,
            entryPoint,
            "--outfile",
            outfile,
        ],
        {
            cwd: appPath,
            stdio: "inherit",
            shell: isWindows,
        }
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

console.log("\nAll builds completed successfully!");
