import { z } from "zod";
import { StatusCodes } from "http-status-codes";
import { FastifyInstanceTyped } from "../../../types/common.js";
import { userPrisma } from "@repo/shared";
import { UserService } from "@repo/shared/services/user.service";
import { PublicIdSchema } from "@repo/shared/types/schemas/common.schemas";
import {
    PublicUser,
    CreateUser,
    PublicUserApiKeyArray,
    CreateUserApiKey,
    Role,
} from "@repo/shared/types/interfaces/user.interface";
import { hasAcess } from "@repo/shared/core/security";

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
        async (req) => {
            return await new UserService(userPrisma).create(req.body);
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
            return await new UserService(userPrisma).findByPublicId(req.params.publicId);
        },
    );

    app.get(
        "/:publicId/api-key",
        {
            schema: {
                tags: ["User"],
                params: PublicIdSchema,
                response: {
                    [StatusCodes.OK]: PublicUserApiKeyArray,
                },
            },
        },
        async (req) => {
            return await new UserService(userPrisma).getApiKeys(req.params.publicId);
        },
    );

    app.post(
        "/:publicId/api-key",
        {
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
        async (req) => {
            const apiKey = await new UserService(userPrisma).createApiKey(
                req.params.publicId,
                req.body,
            );
            return { apiKey };
        },
    );
}
