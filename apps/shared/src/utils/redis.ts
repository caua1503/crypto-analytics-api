import { env } from "@repo/shared/env";
import { RedisClient as BunRedisClient } from "bun";
import crypto from "crypto";
import type { z } from "zod";

// export const redis = new Redis({
//     host: env.REDIS_HOST,
//     port: env.REDIS_PORT,
// });

const connectionString = `redis://${env.REDIS_HOST}:${env.REDIS_PORT}`;

const redis = new BunRedisClient(connectionString);

export class RedisClient {
	private client: BunRedisClient = redis;

	async set(
		key: string,
		value: string,
		expireInSeconds: number = env.REDIS_TIMEOUT_SECONDS,
	): Promise<void> {
		if (expireInSeconds) {
			await this.client.set(key, value, "EX", expireInSeconds);
		} else {
			await this.client.set(key, value);
		}
	}

	async set_json(
		key: string,
		value: unknown,
		expireInSeconds: number = env.REDIS_TIMEOUT_SECONDS,
	): Promise<void> {
		try {
			const stringValue = JSON.stringify(value);
			if (expireInSeconds) {
				await this.client.set(key, stringValue, "EX", expireInSeconds);
			} else {
				await this.client.set(key, stringValue);
			}
		} catch (e) {
			console.error(`Failed to stringify JSON for Redis key ${key}:`, e);
		}
	}

	async get(key: string): Promise<string | null> {
		return await this.client.get(key);
	}

	async get_json<T>(key: string, model?: z.ZodSchema<T>): Promise<T | null> {
		const value = await this.client.get(key);

		if (!value) return null;

		try {
			const parsed = JSON.parse(value);

			if (model) {
				const result = model.safeParse(parsed);
				if (!result.success) {
					console.error(
						`Zod validation failed for Redis key ${key}:`,
						result.error,
					);
					return null;
				}
				return result.data;
			}

			return parsed as T;
		} catch (e) {
			console.error(`Failed to parse JSON from Redis for key ${key}:`, e);
			return null;
		}
	}

	async del(key: string): Promise<void> {
		try {
			await this.client.del(key);
		} catch (e) {
			console.error(`Failed to delete key ${key}:`, e);
		}
	}
}

function normalizeParams(params: Record<string, unknown>) {
	return Object.fromEntries(
		Object.entries(params)
			.filter(([, value]) => value !== undefined)
			.map(([key, value]): [string, unknown] => {
				if (value instanceof Date) {
					return [key, value.toISOString()];
				}
				return [key, value];
			})
			.sort(([a], [b]) => a.localeCompare(b)),
	);
}

export function buildCacheKey(
	prefix: string,
	params: Record<string, unknown>,
): string {
	const normalized = normalizeParams(params);
	const hash = crypto
		.createHash("sha256")
		.update(JSON.stringify(normalized))
		.digest("hex");

	return `${prefix}:${hash}`;
}
