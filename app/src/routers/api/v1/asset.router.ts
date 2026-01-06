import { FastifyInstanceTyped } from "../../../types/common.js";
import { AssetService } from "../../../services/asset.service.js";
import { prisma } from "../../../config/prisma.js";
import { AssetCreate } from "../../../types/interfaces/asset.interface.js";
import { IdSchema, SymbolSchema } from "../../../types/schemas/common.schemas.js";

export async function assetRoutes(app: FastifyInstanceTyped) {
    app.get("/", async (req, res) => {
        return { assets: await new AssetService(prisma).findAll() };
    });

    app.get("/:id", { schema: { params: IdSchema } }, async (req, res) => {
        return await new AssetService(prisma).findById(req.params.id);
    });

    app.get("/symbol/:symbol", { schema: { params: SymbolSchema } }, async (req, res) => {
        return await new AssetService(prisma).findBySymbol(req.params.symbol);
    });

    app.post("/", { schema: { body: AssetCreate } }, async (req, res) => {
        return await new AssetService(prisma).create(req.body);
    });
}
