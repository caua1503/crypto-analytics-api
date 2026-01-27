import { FastifyInstanceTyped } from "../../../types/common.js";
import { AssetService } from "../../../services/asset.service.js";
import { prisma } from "../../../config/prisma.js";
import {
    Asset,
    AssetPublic,
    AssetCreate,
    AssetExtras,
    AssetExtrasArray,
    AssetPublicResponse,
} from "../../../types/interfaces/asset.interface.js";
import { IdSchema, SymbolSchema } from "../../../types/schemas/common.schemas.js";
import { z } from "zod";
import { PaginationParams } from "../../../types/interfaces/common.interface.js";

import { StatusCodes } from "http-status-codes";

export async function assetRoutes(app: FastifyInstanceTyped) {
    app.get(
        "/",
        {
            schema: {
                tags: ["Asset"],
                querystring: PaginationParams,
                response: {
                    [StatusCodes.OK]: AssetPublicResponse,
                },
            },
        },
        async (req) => {
            return await new AssetService(prisma).findAll(req.query);
        },
    );

    app.get(
        "/extras",
        {
            schema: {
                tags: ["Asset"],
                querystring: PaginationParams,
                response: {
                    [StatusCodes.OK]: z.object({
                        assets: AssetExtrasArray,
                    }),
                },
            },
        },
        async (req) => {
            return { assets: await new AssetService(prisma).findAllWithExtras(req.query) };
        },
    );

    app.get(
        "/:symbol",
        {
            schema: {
                tags: ["Asset"],
                params: SymbolSchema,
                response: {
                    [StatusCodes.OK]: AssetPublic,
                },
            },
        },
        async (req) => {
            return await new AssetService(prisma).findBySymbol(req.params.symbol);
        },
    );

    app.get(
        "/:symbol/extras",
        {
            schema: {
                tags: ["Asset"],
                params: SymbolSchema,
                response: {
                    [StatusCodes.OK]: AssetExtras,
                },
            },
        },
        async (req) => {
            return await new AssetService(prisma).findBySymbolWithExtras(req.params.symbol);
        },
    );

    app.get(
        "/id/:id",
        {
            schema: {
                tags: ["Asset"],
                params: IdSchema,
                response: {
                    [StatusCodes.OK]: AssetPublic,
                },
            },
        },
        async (req) => {
            return await new AssetService(prisma).findById(req.params.id);
        },
    );

    app.get(
        "/id/:id/extras",
        {
            schema: {
                tags: ["Asset"],
                params: IdSchema,
                response: {
                    [StatusCodes.OK]: AssetExtras,
                },
            },
        },
        async (req) => {
            return await new AssetService(prisma).findByIdWithExtras(req.params.id);
        },
    );

    app.post(
        "/",
        {
            schema: {
                tags: ["Asset"],
                body: AssetCreate,
                response: {
                    [StatusCodes.CREATED]: Asset,
                },
            },
        },
        async (req, res) => {
            return await new AssetService(prisma).create(req.body);
        },
    );
    app.patch(
        "/id/:id",
        {
            schema: {
                tags: ["Asset"],
                params: IdSchema,
                body: AssetCreate.partial(),
                response: {
                    [StatusCodes.CREATED]: Asset,
                },
            },
        },
        async (req, res) => {
            return await new AssetService(prisma).update(req.params.id, req.body);
        },
    );
    app.delete(
        "/id/:id",
        {
            schema: {
                tags: ["Asset"],
                params: IdSchema,
            },
        },
        async (req, res) => {
            return await new AssetService(prisma).delete(req.params.id);
        },
    );
}
