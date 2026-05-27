import crypto from "node:crypto";
import { httpErrors } from "@fastify/sensible";
import { userPrisma } from "@repo/shared";
import type { RateLimitConfig } from "@repo/shared/core/ratelimit";
import { applyRateLimit } from "@repo/shared/core/ratelimit";
import { env } from "@repo/shared/env";
import { UserService } from "@repo/shared/services/user.service";
import type { FastifyJwtInstance } from "@repo/shared/types/common";
import { ApiKeyMode } from "@repo/shared/types/common";
import type {
	AuthenticatedIdentity,
	AuthTokensResponseType,
	PayloadAcessToken,
	PayloadRefreshToken,
	RoleType,
} from "@repo/shared/types/interfaces/user.interface";
import Bun from "bun";
import type { FastifyReply, FastifyRequest } from "fastify";

export async function getPasswordHash(password: string): Promise<string> {
	return await Bun.password.hash(password, {
		algorithm: "argon2id",
		memoryCost: 65536,
		timeCost: 2,
	});
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	return await Bun.password.verify(password, hash);
}

export function createApiKey(mode: ApiKeyMode = ApiKeyMode.PROD) {
	const code = crypto.randomBytes(32).toString("hex");
	return `caa_${mode}_${code}`;
}

export function signAuthTokens(
	app: FastifyJwtInstance,
	payload: PayloadAcessToken & { sessionId: string },
	rememberMe = false,
): AuthTokensResponseType {
	const accessToken = app.jwt.access.sign({
		sub: payload.sub,
		role: payload.role,
	});
	const refreshToken = app.jwt.refresh.sign(
		{ sub: payload.sub, sessionId: payload.sessionId },
		{ expiresIn: rememberMe ? "30d" : "7d" },
	);
	return { accessToken, refreshToken, expiresIn: 15 * 60 };
}

export function verifyRefreshToken(app: FastifyJwtInstance, token: string): PayloadRefreshToken {
	return app.jwt.refresh.verify(token);
}
const rulesPriority: Record<RoleType, number> = {
	FREE: 1,
	PRO: 2,
	TRADER: 3,
	ADMIN: 4,
};

interface HasAcessConfig {
	role?: RoleType[] | null;
	required_api_scope?: string | null;
	usage_bearer?: boolean;
	usage_api_key?: boolean;
	rateLimit?: RateLimitConfig;
}

export function hasAcess(
	config: HasAcessConfig = {},
): (request: FastifyRequest, reply: FastifyReply) => Promise<void> {
	const {
		role = null,
		required_api_scope = null,
		usage_bearer = true,
		usage_api_key = true,
	} = config;
	return async (request: FastifyRequest, _reply: FastifyReply) => {
		const authHeader = request.headers.authorization;
		const apiKey = request.headers["x-api-key"];

		request.identity = null;

		const url = request.raw.url || "";

		if (url.startsWith("/docs") && env.NODE_ENV === "development") {
			return;
		}

		const routeConfig = request.routeOptions.config as { public?: boolean } | undefined;
		if (routeConfig?.public === true) {
			return;
		}

		if (!usage_bearer && authHeader) {
			throw httpErrors.unauthorized("Unauthorized");
		}

		if (!usage_api_key && apiKey) {
			throw httpErrors.unauthorized("Unauthorized");
		}

		if (usage_bearer && authHeader?.startsWith("Bearer ")) {
			const token = authHeader.split(" ")[1];

			const server = request.server as unknown as FastifyJwtInstance;
			const payload: PayloadAcessToken = await server.jwt.access.verify(token);
			if (
				role?.length &&
				rulesPriority[payload.role] < Math.min(...role.map((r) => rulesPriority[r]))
			) {
				throw httpErrors.forbidden("Forbidden");
			}

			request.identity = {
				type: "bearer",
				sub: payload.sub,
				role: payload.role,
			} satisfies AuthenticatedIdentity;

			if (config.rateLimit) {
				await applyRateLimit(request, _reply, config.rateLimit, request.identity);
			}
			return;
		}

		if (usage_api_key && apiKey) {
			const rawApiKey = Array.isArray(apiKey) ? apiKey[0] : apiKey;
			const userService = new UserService(userPrisma);

			const verifiedKey = await userService.verifyApiKey(rawApiKey);

			if (verifiedKey.ipWhitelist.length > 0) {
				const clientIp = request.ip;
				if (!verifiedKey.ipWhitelist.includes(clientIp)) {
					throw httpErrors.forbidden("IP not allowed for this API Key");
				}
			}

			if (required_api_scope && !verifiedKey.scopes.includes(required_api_scope)) {
				throw httpErrors.forbidden(`Missing required scope: ${required_api_scope}`);
			}

			if (
				role?.length &&
				rulesPriority[verifiedKey.role as RoleType] <
					Math.min(...role.map((r) => rulesPriority[r]))
			) {
				throw httpErrors.forbidden("Insufficient role for this API Key");
			}

			// DISPARAR EVENTO DE TRACKING
			userPrisma.userApiKey
				.update({
					where: { id: verifiedKey.id },
					data: { lastUsedAt: new Date() },
				})
				.catch((err) => {
					console.error("Failed to update API key lastUsedAt:", err);
				});

			request.identity = {
				type: "api_key",
				keyId: verifiedKey.id,
				role: verifiedKey.role as RoleType,
				scopes: verifiedKey.scopes,
			} satisfies AuthenticatedIdentity;

			if (config.rateLimit) {
				await applyRateLimit(request, _reply, config.rateLimit, request.identity);
			}
			return;
		}

		throw httpErrors.unauthorized("Unauthorized");
	};
}
