import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { platform } from "node:os";

const apps = ["api", "scheduler", "workers"];
const buildDir = join(import.meta.dirname, "build");

if (!existsSync(buildDir)) {
    mkdirSync(buildDir);
    console.log(`Created build directory: ${buildDir}`);
}

const isWindows = platform() === "win32";

for (const app of apps) {
    const appPath = join(import.meta.dirname, "apps", app);
    const fileName = isWindows ? `${app}.exe` : app;
    const outfile = join(buildDir, fileName);

    console.log(`Building ${app}...`);

    const result = spawnSync(
        "bun",
        [
            "build",
            "--compile",
            "--minify",
            "--bytecode",
            "src/index.ts",
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

console.log("\nAll builds completed successfully!");
