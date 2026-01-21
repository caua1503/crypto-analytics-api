import { Redis } from "ioredis";
import { env } from "./env.js";
import { z } from "zod";

export const redis = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
});

export class RedisClient {
    private client: Redis;

    constructor(client: Redis) {
        this.client = client;
    }

    async set(key: string, value: string, expireInSeconds?: number): Promise<void> {
        if (expireInSeconds) {
            await this.client.set(key, value, "EX", expireInSeconds);
        } else {
            await this.client.set(key, value);
        }
    }

    async set_json(key: string, value: any, expireInSeconds?: number): Promise<void> {
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

    async get_json<T>(key: string): Promise<T | null> {
        const value = await this.client.get(key);
        if (value) {
            try {
                return JSON.parse(value) as T;
            } catch (e) {
                console.error(`Failed to parse JSON from Redis for key ${key}:`, e);
                return null;
            }
        }
        return null;
    }

    async del(key: string): Promise<number> {
        return await this.client.del(key);
    }
}
