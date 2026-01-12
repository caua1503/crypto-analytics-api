import { z } from "zod";
import { StatusCodes } from "http-status-codes";
import { FastifyInstanceTyped } from "../../../types/common.js";
import { prisma } from "../../../config/prisma.js";
import { IdSchema, SymbolSchema } from "../../../types/schemas/common.schemas.js";
import { PaginationParams } from "../../../types/interfaces/common.interface.js";
import {
    MarketSnapshotCreate,
    MarketSnapshotResponse,
} from "../../../types/interfaces/market.interface.js";
import { MarketSnapshotService } from "../../../services/market.service.js";

export async function marketRoutes(app: FastifyInstanceTyped) {
    app.get(
        "/asset/:id",
        {
            schema: {
                tags: ["Market"],
                params: IdSchema,
                querystring: PaginationParams,
                response: {
                    [StatusCodes.OK]: z.object({
                        markets: z.array(MarketSnapshotResponse),
                    }),
                },
            },
        },
        async (req) => {
            return {
                markets: await new MarketSnapshotService(prisma).findAll(req.params.id, req.query),
            };
        },
    );
    app.get(
        "/:id",
        {
            schema: {
                tags: ["Market"],
                params: IdSchema,
                response: {
                    [StatusCodes.OK]: MarketSnapshotResponse,
                },
            },
        },
        async (req) => {
            return await new MarketSnapshotService(prisma).findById(req.params.id);
        },
    );
    app.get(
        "/asset/:id/latest",
        {
            schema: {
                tags: ["Market"],
                params: IdSchema,
                response: {
                    [StatusCodes.OK]: MarketSnapshotResponse,
                },
            },
        },
        async (req) => {
            return await new MarketSnapshotService(prisma).getLatestSnapshotByAssetId(
                req.params.id,
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
                    [StatusCodes.OK]: MarketSnapshotResponse,
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
                    [StatusCodes.CREATED]: MarketSnapshotResponse,
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
                params: IdSchema,
                body: MarketSnapshotCreate.partial(),
                response: {
                    [StatusCodes.OK]: MarketSnapshotResponse,
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
                params: IdSchema,
            },
        },
        async (req) => {
            return await new MarketSnapshotService(prisma).delete(req.params.id);
        },
    );
}
