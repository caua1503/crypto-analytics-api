import { FastifyInstanceTyped } from "../../../types/common.js";
import { AssetService } from "../../../services/asset.service.js";
import { prisma } from "../../../config/prisma.js";
import { AssetCreate, Asset } from "../../../types/interfaces/asset.interface.js";
import { IdSchema, SymbolSchema } from "../../../types/schemas/common.schemas.js";
import { z } from "zod";

export async function assetRoutes(app: FastifyInstanceTyped) {
    app.get(
        "/",
        {
            schema: {
                response: {
                    200: z.object({
                        assets: z.array(Asset),
                    }),
                },
            },
        },
        async () => {
            return { assets: await new AssetService(prisma).findAll() };
        },
    );

    app.get(
        "/symbol/:symbol",
        {
            schema: {
                params: SymbolSchema,
                response: {
                    200: Asset,
                },
            },
        },
        async (req) => {
            return await new AssetService(prisma).findBySymbol(req.params.symbol);
        },
    );

    app.get(
        "/:id",
        {
            schema: {
                params: IdSchema,
                response: {
                    200: Asset,
                },
            },
        },
        async (req) => {
            return await new AssetService(prisma).findById(req.params.id);
        },
    );

    app.post(
        "/",
        {
            schema: {
                body: AssetCreate,
                response: {
                    201: Asset,
                },
            },
        },
        async (req, res) => {
            return await new AssetService(prisma).create(req.body);
        },
    );
}
