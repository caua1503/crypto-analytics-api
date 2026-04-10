import { z } from "zod";
import { StatusCodes } from "http-status-codes";
import { FastifyInstanceTyped } from "../../../types/common.js";
import { prisma } from "@repo/shared";
import { IdSchema, SymbolSchema, PublicIdSchema } from "@repo/shared/types/schemas/common.schemas";
import { PaginationParams } from "@repo/shared/types/interfaces/common.interface";
import {
    MarketSnapshot,
    MarketSnapshotCreate,
    MarketSnapshotResponse,
    MarketSnapshotSimpleResponse,
} from "@repo/shared/types/interfaces/market.interface";
import { MarketSnapshotService } from "@repo/shared/services/market.service";

export async function marketRoutes(app: FastifyInstanceTyped) {
    app.get(
        "/asset/:symbol",
        {
            schema: {
                tags: ["Market"],
                params: SymbolSchema,
                querystring: PaginationParams.extend({
                    order: z.enum(["asc", "desc"]).default("desc"),
                }),
                response: {
                    [StatusCodes.OK]: MarketSnapshotResponse,
                },
            },
        },
        async (req) => {
            return await new MarketSnapshotService(prisma).findAllBySymbol(
                req.params.symbol,
                req.query,
            );
        },
    );
    app.get(
        "/asset/id/:publicId",
        {
            schema: {
                tags: ["Market"],
                params: PublicIdSchema,
                querystring: PaginationParams,
                security: [],
                response: {
                    [StatusCodes.OK]: MarketSnapshotResponse,
                },
            },
        },
        async (req) => {
            return await new MarketSnapshotService(prisma).findAllByPublicID(
                req.params.publicId,
                req.query,
            );
        },
    );
    app.get(
        "/:id",
        {
            schema: {
                tags: ["Market"],
                params: IdSchema,
                response: {
                    [StatusCodes.OK]: MarketSnapshotSimpleResponse,
                },
            },
        },
        async (req) => {
            return await new MarketSnapshotService(prisma).findById(req.params.id);
        },
    );
    app.get(
        "/asset/:publicId/latest",
        {
            schema: {
                tags: ["Market"],
                params: PublicIdSchema,
                response: {
                    [StatusCodes.OK]: MarketSnapshotSimpleResponse,
                },
            },
        },
        async (req) => {
            return await new MarketSnapshotService(prisma).getLatestSnapshotByPublicId(
                req.params.publicId,
            );
        },
    );
    app.get(
        "/asset/symbol/:symbol/latest",
        {
            schema: {
                tags: ["Market"],
                params: SymbolSchema,
                response: {
                    [StatusCodes.OK]: MarketSnapshotSimpleResponse,
                },
            },
        },
        async (req) => {
            return await new MarketSnapshotService(prisma).getLatestSnapshotBySymbol(
                req.params.symbol,
            );
        },
    );
    app.post(
        "/",
        {
            schema: {
                tags: ["Market"],
                body: MarketSnapshotCreate,
                response: {
                    [StatusCodes.CREATED]: MarketSnapshotSimpleResponse,
                },
            },
        },
        async (req) => {
            return await new MarketSnapshotService(prisma).create(req.body);
        },
    );
    app.patch(
        "/:id",
        {
            schema: {
                tags: ["Market"],
                params: IdSchema,
                body: MarketSnapshotCreate.partial(),
                response: {
                    [StatusCodes.OK]: MarketSnapshotSimpleResponse,
                },
            },
        },
        async (req) => {
            return await new MarketSnapshotService(prisma).update(req.params.id, req.body);
        },
    );
    app.delete(
        "/:id",
        {
            schema: {
                tags: ["Market"],
                params: IdSchema,
            },
        },
        async (req) => {
            return await new MarketSnapshotService(prisma).delete(req.params.id);
        },
    );
}
