import { httpErrors } from "@fastify/sensible";
import type { PrismaClientType } from "../config/prisma.js";
import {
    Asset,
    AssetCreate,
    AssetArray,
    type AssetCreateType,
    type AssetType,
    AssetExtras,
    AssetExtrasArray,
    AssetExtrasType,
    AssetResponse,
    AssetResponseType,
} from "../types/interfaces/asset.interface.js";
import {
    PaginationParams,
    type PaginationParamsType,
} from "../types/interfaces/common.interface.js";

export class AssetService {
    constructor(private prisma: PrismaClientType) {}

    async findAll(
        pagination: PaginationParamsType = PaginationParams.parse({}),
    ): Promise<AssetResponseType> {
        const { skip, take, order } = pagination;

        const [assets, total] = await Promise.all([
            this.prisma.asset.findMany({
                skip: skip,
                take: take,
                orderBy: { createdAt: order },
            }),
            this.prisma.asset.count(),
        ]);
        console.log(assets);
        if (!assets) {
            throw httpErrors.notFound("No assets found");
        }

        const data = AssetResponse.parse({
            meta: { total },
            data: assets,
        });

        return data;
    }

    async findAllWithExtras(
        pagination: PaginationParamsType = PaginationParams.parse({}),
    ): Promise<AssetExtrasType[]> {
        const { skip, take, order } = pagination;

        const assets = await this.prisma.asset.findMany({
            skip: skip,
            take: take,
            orderBy: { createdAt: order },
        });

        if (!assets) {
            throw httpErrors.notFound("No assets found");
        }
        // console.log(assets);
        return AssetExtrasArray.parse(assets);
    }

    async findById(id: number): Promise<AssetType> {
        const asset = await this.prisma.asset.findUnique({ where: { id } });

        if (!asset) {
            throw httpErrors.notFound("Asset not found");
        }

        return Asset.parse(asset);
    }

    async findByIdWithExtras(id: number): Promise<AssetExtrasType> {
        const asset = await this.prisma.asset.findUnique({ where: { id } });

        if (!asset) {
            throw httpErrors.notFound("Asset not found");
        }

        return AssetExtras.parse(asset);
    }

    async findBySymbol(symbol: string): Promise<AssetType> {
        const asset = await this.prisma.asset.findUnique({ where: { symbol } });
        if (!asset) {
            throw httpErrors.notFound("Asset not found");
        }
        return Asset.parse(asset);
    }

    async findBySymbolWithExtras(symbol: string): Promise<AssetExtrasType> {
        const asset = await this.prisma.asset.findUnique({ where: { symbol } });
        if (!asset) {
            throw httpErrors.notFound("Asset not found");
        }
        return AssetExtras.parse(asset);
    }

    async create(data: AssetCreateType): Promise<AssetType> {
        try {
            const validatedData = AssetCreate.parse(data);
            return this.prisma.asset.create({ data: validatedData });
        } catch (error) {
            throw httpErrors.badRequest("Invalid asset data");
        }
    }

    async update(id: number, data: Partial<AssetCreateType>): Promise<AssetType> {
        try {
            const validatedData = AssetCreate.partial().parse(data);
            return this.prisma.asset.update({ where: { id }, data: validatedData });
        } catch (error) {
            throw httpErrors.badRequest("Invalid asset data");
        }
    }

    async delete(id: number): Promise<void> {
        try {
            await this.prisma.asset.delete({ where: { id } });
        } catch (error) {
            throw httpErrors.notFound("Asset not found");
        }
    }
}
