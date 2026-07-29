import { spawnSync } from "node:child_process";
import { GenericContainer, type StartedTestContainer, Wait } from "testcontainers";
import { runPrismaMigrations } from "./migrations.js";

const POSTGRES_PORT = 5432;
const REDIS_PORT = 6379;
const MARKET_DATABASE = "crypto_api_test";
const USER_DATABASE = "crypto_user_test";
const MARKET_USER = "crypto_api";
const USER_USER = "crypto_user";
const MARKET_PASSWORD = "crypto_api";
const USER_PASSWORD = "crypto_user";

type TestEnvironment = {
	marketPostgres: StartedTestContainer;
	userPostgres: StartedTestContainer;
	redis: StartedTestContainer;
};

let environment: TestEnvironment | null = null;

function assertDockerIsAvailable() {
	const result = spawnSync("docker", ["info"], {
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
	});

	if (result.status === 0) {
		return;
	}

	const output = [result.stderr, result.stdout].filter(Boolean).join("\n").trim();

	throw new Error(
		[
			"Docker is required to run API integration tests with Testcontainers.",
			"Run `docker info` or `docker ps` and make sure your user can access the Docker daemon.",
			"On Linux, this usually means starting Docker and adding your user to the `docker` group, then opening a new shell.",
			output ? `Docker output: ${output}` : null,
		]
			.filter(Boolean)
			.join("\n"),
	);
}

function postgresUrl(
	container: StartedTestContainer,
	user: string,
	password: string,
	database: string,
) {
	return `postgresql://${user}:${password}@${container.getHost()}:${container.getMappedPort(
		POSTGRES_PORT,
	)}/${database}`;
}

function setTestEnv(env: TestEnvironment) {
	const databaseUrl = postgresUrl(
		env.marketPostgres,
		MARKET_USER,
		MARKET_PASSWORD,
		MARKET_DATABASE,
	);
	const userDatabaseUrl = postgresUrl(env.userPostgres, USER_USER, USER_PASSWORD, USER_DATABASE);

	process.env.NODE_ENV = "test";
	process.env.HOST = "127.0.0.1";
	process.env.PORT = "0";
	process.env.DATABASE_URL = databaseUrl;
	process.env.USER_DATABASE_URL = userDatabaseUrl;
	process.env.MIGRATE_DB = databaseUrl;
	process.env.MIGRATE_DB_USER = userDatabaseUrl;
	process.env.REDIS_HOST = env.redis.getHost();
	process.env.REDIS_PORT = String(env.redis.getMappedPort(REDIS_PORT));
	process.env.REDIS_TIMEOUT_SECONDS = "60";
	process.env.JWT_ACCESS_SECRET = "test_access_secret_32_chars_minimum_value";
	process.env.JWT_REFRESH_SECRET = "test_refresh_secret_32_chars_minimum_value";
}

async function startPostgres(user: string, password: string, database: string) {
	return await new GenericContainer("postgres:16-alpine")
		.withExposedPorts(POSTGRES_PORT)
		.withEnvironment({
			POSTGRES_DB: database,
			POSTGRES_PASSWORD: password,
			POSTGRES_USER: user,
		})
		.withWaitStrategy(Wait.forLogMessage("database system is ready to accept connections", 2))
		.start();
}

async function startRedis() {
	return await new GenericContainer("redis:8.0-alpine")
		.withExposedPorts(REDIS_PORT)
		.withWaitStrategy(Wait.forLogMessage("Ready to accept connections"))
		.start();
}

export async function startTestEnvironment() {
	if (environment) {
		return environment;
	}

	assertDockerIsAvailable();

	const startedContainers: StartedTestContainer[] = [];

	try {
		const [marketPostgres, userPostgres, redis] = await Promise.all([
			startPostgres(MARKET_USER, MARKET_PASSWORD, MARKET_DATABASE),
			startPostgres(USER_USER, USER_PASSWORD, USER_DATABASE),
			startRedis(),
		]);
		startedContainers.push(marketPostgres, userPostgres, redis);

		environment = {
			marketPostgres,
			userPostgres,
			redis,
		};
	} catch (error) {
		await Promise.all(startedContainers.map((container) => container.stop()));
		throw error;
	}

	const readyEnvironment = environment;
	if (!readyEnvironment) {
		throw new Error("Failed to start test environment");
	}

	setTestEnv(readyEnvironment);
	runPrismaMigrations();

	return readyEnvironment;
}

export async function stopTestEnvironment() {
	if (!environment) {
		return;
	}

	await Promise.all([
		environment.redis.stop(),
		environment.userPostgres.stop(),
		environment.marketPostgres.stop(),
	]);

	environment = null;
}
