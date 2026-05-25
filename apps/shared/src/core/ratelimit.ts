import { httpErrors } from "@fastify/sensible";
import { RedisClient } from "@repo/shared";
import type { AuthenticatedIdentity } from "@repo/shared/types/interfaces/user.interface";
import type { FastifyReply, FastifyRequest } from "fastify";

export interface RateLimitConfig {
	limit: number;
	windowSeconds: number;
	by?: "ip" | "user" | "auto";
	prefix?: string;
}

function resolveIdentifier(
	request: FastifyRequest,
	by: "ip" | "user" | "auto",
	identity: AuthenticatedIdentity | null | undefined,
): { method: string; id: string } {
	if (by === "ip") {
		return { method: "ip", id: request.ip };
	}

	if (by === "user") {
		if (!identity) {
			throw httpErrors.unauthorized("Authentication required for rate limiting");
		}
		const id = identity.type === "bearer" ? identity.sub : String(identity.keyId);
		return { method: "user", id };
	}

	if (identity) {
		const id = identity.type === "bearer" ? identity.sub : String(identity.keyId);
		return { method: "user", id };
	}
	return { method: "ip", id: request.ip };
}

export async function applyRateLimit(
	request: FastifyRequest,
	reply: FastifyReply,
	config: RateLimitConfig,
	identity?: AuthenticatedIdentity | null,
): Promise<void> {
	const redis = new RedisClient();
	const by = config.by ?? "auto";
	const { method, id } = resolveIdentifier(request, by, identity);

	const routeKey = config.prefix ?? `${request.method}:${request.routeOptions.url}`;
	const key = `ratelimit:${routeKey}:${method}:${id}`;

	const count = await redis.incr(key);

	if (count === 1) {
		await redis.expire(key, config.windowSeconds);
	}

	const ttl = await redis.ttl(key);
	const remaining = Math.max(0, config.limit - count);

	reply.headers({
		"X-RateLimit-Limit": config.limit,
		"X-RateLimit-Remaining": remaining,
		"X-RateLimit-Reset": ttl,
	});

	if (count > config.limit) {
		throw httpErrors.tooManyRequests("Rate limit exceeded");
	}
}
