import { httpErrors } from "@fastify/sensible";
import { userPrisma } from "@repo/shared";
import { env } from "@repo/shared/env";
import { UserService } from "@repo/shared/services/user.service";
import { ApiKeyMode } from "@repo/shared/types/common";
import {
	type AuthTokensResponseType,
	LoginType,
	type PayloadAcessToken,
	type PayloadRefreshToken,
	type RoleType,
	UserType,
} from "@repo/shared/types/interfaces/user.interface";
import Bun from "bun";
import crypto from "crypto";
import { type FastifyReply, type FastifyRequest, preHandlerHookHandler } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

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
	app: any, // fastify instance
	payload: PayloadAcessToken & { sessionId: string },
	rememberMe = false,
): AuthTokensResponseType {
	const accessToken = app.jwt.access.sign({ sub: payload.sub, role: payload.role });
	const refreshToken = app.jwt.refresh.sign(
		{ sub: payload.sub, sessionId: payload.sessionId },
		{ expiresIn: rememberMe ? "30d" : "7d" },
	);
	return { accessToken, refreshToken, expiresIn: 15 * 60 };
}

export function verifyRefreshToken(app: any, token: string): PayloadRefreshToken {
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
}

export function hasAcess(config: HasAcessConfig = {}): any {
	const {
		role = null,
		required_api_scope = null,
		usage_bearer = true,
		usage_api_key = true,
	} = config;
	return async (request: FastifyRequest, reply: FastifyReply) => {
		const authHeader = request.headers.authorization;
		const apiKey = request.headers["x-api-key"];

		const url = request.raw.url || "";

		if (url.startsWith("/docs") && env.NODE_ENV === "development") {
			return;
		}

		if (!usage_bearer && authHeader) {
			console.log("Unauthorized - 1 ");
			throw httpErrors.unauthorized("Unauthorized");
		}

		if (!usage_api_key && apiKey) {
			console.log("Unauthorized - 2 ");
			throw httpErrors.unauthorized("Unauthorized");
		}

		if (usage_bearer && authHeader?.startsWith("Bearer ")) {
			const token = authHeader.split(" ")[1];
			// console.log(token);

			// @ts-expect-error
			const payload = (await request.server.jwt.access.verify(token)) as PayloadAcessToken;
			// console.log(payload);
			if (
				role?.length &&
				rulesPriority[payload.role] < Math.min(...role.map((r) => rulesPriority[r]))
			) {
				throw httpErrors.forbidden("Forbidden");
			}

			// if (required_api_scope && !payload.scopes?.includes(required_api_scope)) {
			//     throw httpErrors.forbidden("Missing scope");
			// }

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

			void userPrisma.userApiKey.update({
				where: { id: verifiedKey.id },
				data: { lastUsedAt: new Date() },
			});

			return;
		}

		// console.log("Unauthorized - final ");
		// throw httpErrors.unauthorized("Unauthorized");
	};
}
