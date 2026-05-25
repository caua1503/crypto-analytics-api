import type { RateLimitConfig } from "@repo/shared/core/ratelimit";
import { applyRateLimit } from "@repo/shared/core/ratelimit";
import type { FastifyReply, FastifyRequest } from "fastify";

export type { RateLimitConfig };
export { applyRateLimit };

/** preHandler para rotas sem hasAcess */
export function rateLimit(
	config: RateLimitConfig,
): (request: FastifyRequest, reply: FastifyReply) => Promise<void> {
	return async (request: FastifyRequest, reply: FastifyReply) => {
		const identity = (request as FastifyRequest & { identity?: unknown }).identity as
			| Parameters<typeof applyRateLimit>[3]
			| undefined;
		await applyRateLimit(request, reply, config, identity);
	};
}
