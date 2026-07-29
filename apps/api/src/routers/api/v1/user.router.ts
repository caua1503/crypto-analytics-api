import { httpErrors } from "@fastify/sensible";
import { userPrisma } from "@repo/shared";
import { hasAcess } from "@repo/shared/core/security";
import { UserService } from "@repo/shared/services/user.service";
import {
	CreateUser,
	CreateUserApiKey,
	PublicUser,
	PublicUserApiKeyArray,
} from "@repo/shared/types/interfaces/user.interface";
import { PublicIdSchema } from "@repo/shared/types/schemas/common.schemas";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import type { FastifyInstanceTyped } from "../../../types/common.js";

const userService = new UserService(userPrisma);

export async function userRoutes(app: FastifyInstanceTyped) {
	app.post(
		"/",
		{
			preHandler: hasAcess({ role: ["ADMIN"] }),
			schema: {
				description: "Create a new user for admin",
				tags: ["User"],
				body: CreateUser,
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

	app.get(
		"/:publicId",
		{
			preHandler: hasAcess({ role: ["ADMIN"] }),
			schema: {
				tags: ["User"],
				params: PublicIdSchema,
				response: {
					[StatusCodes.OK]: PublicUser,
				},
			},
		},
		async (req) => {
			return await userService.findByPublicId(req.params.publicId);
		},
	);

	app.get(
		"/:publicId/api-key",
		{
			preHandler: hasAcess({ usage_api_key: false }),
			schema: {
				tags: ["User"],
				params: PublicIdSchema,
				response: {
					[StatusCodes.OK]: PublicUserApiKeyArray,
				},
			},
		},
		async (req) => {
			const identity = req.identity;

			// Only ADMIN can query other users' API keys
			if (
				identity?.role !== "ADMIN" &&
				(identity?.type !== "bearer" || identity.sub !== req.params.publicId)
			) {
				throw httpErrors.forbidden("Access denied");
			}

			return await userService.getApiKeys(req.params.publicId);
		},
	);

	app.post(
		"/:publicId/api-key",
		{
			preHandler: hasAcess({ usage_api_key: false }),
			schema: {
				tags: ["User"],
				params: PublicIdSchema,
				body: CreateUserApiKey,
				response: {
					[StatusCodes.CREATED]: z.object({
						apiKey: z.string(),
					}),
				},
			},
		},
		async (req, reply) => {
			const identity = req.identity;

			// Only ADMIN can create API keys for other users
			if (
				identity?.role !== "ADMIN" &&
				(identity?.type !== "bearer" || identity.sub !== req.params.publicId)
			) {
				throw httpErrors.forbidden("Access denied");
			}

			const apiKey = await userService.createApiKey(req.params.publicId, req.body);
			reply.code(StatusCodes.CREATED);
			return { apiKey };
		},
	);
}
