import { httpErrors } from "@fastify/sensible";
import { userPrisma } from "@repo/shared";
import { signAuthTokens, verifyRefreshToken } from "@repo/shared/core/security";
import { UserService, UserSessionService } from "@repo/shared/services/user.service";
import type { FastifyJwtInstance } from "@repo/shared/types/common";
import {
	AuthTokensResponse,
	CreateUser,
	Login,
	type PayloadRefreshToken,
	PublicUser,
	RefreshToken,
} from "@repo/shared/types/interfaces/user.interface";
import { StatusCodes } from "http-status-codes";
import type { FastifyInstanceTyped } from "../../../types/common.js";

const userService = new UserService(userPrisma);
const sessionService = new UserSessionService(userPrisma);

export async function registerAuthRoutes(app: FastifyInstanceTyped) {
	app.post(
		"/login",
		{
			config: { public: true },
			schema: {
				tags: ["Auth"],
				body: Login,
				security: [],
				response: {
					[StatusCodes.OK]: AuthTokensResponse,
				},
			},
		},
		async (req) => {
			const { payload, userId } = await userService.createPayloadAcessToken(req.body);

			const session = await sessionService.create({
				userId,
				expiresAt: new Date(
					Date.now() +
						(req.body.rememberMe ? 7 * 24 * 60 * 60 * 1000 : 1 * 24 * 60 * 60 * 1000),
				),
				ip: req.ip,
				userAgent: req.headers["user-agent"],
				metadata: {},
			});

			const tokens = signAuthTokens(
				app as unknown as FastifyJwtInstance,
				{ ...payload, sessionId: session.publicId },
				req.body.rememberMe,
			);
			return tokens;
		},
	);

	app.post(
		"/register",
		{
			config: { public: true },
			schema: {
				tags: ["Auth"],
				body: CreateUser.omit({ role: true }),
				security: [],
				response: {
					[StatusCodes.CREATED]: PublicUser,
				},
			},
		},
		async (req, reply) => {
			reply.code(StatusCodes.CREATED);
			return await userService.create(req.body);
		},
	);

	app.post(
		"/refresh",
		{
			config: { public: true },
			schema: {
				tags: ["Auth"],
				body: RefreshToken,
				security: [],
				response: {
					[StatusCodes.OK]: AuthTokensResponse,
				},
			},
		},
		async (req) => {
			const { refreshToken } = req.body;
			let decoded: PayloadRefreshToken;
			try {
				decoded = verifyRefreshToken(app as unknown as FastifyJwtInstance, refreshToken);
			} catch (_err) {
				throw httpErrors.unauthorized("Invalid or expired refresh token");
			}

			const session = await sessionService.findByPublicId(decoded.sessionId);

			if (session.revokedAt) {
				throw httpErrors.unauthorized("Session revoked");
			}

			if (new Date() > session.expiresAt) {
				throw httpErrors.unauthorized("Session expired");
			}

			await sessionService.delete(decoded.sessionId);

			const newSession = await sessionService.create({
				userId: session.userId,
				expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Default 1d extension
				ip: req.ip,
				userAgent: req.headers["user-agent"],
				metadata: {
					rotatedFrom: decoded.sessionId,
				},
			});

			const user = await userService.findByID(session.userId);

			const payload = {
				sub: user.publicId,
				role: user.role,
				sessionId: newSession.publicId,
			};

			return signAuthTokens(app as unknown as FastifyJwtInstance, payload);
		},
	);
}
