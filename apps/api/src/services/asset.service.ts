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
import { RedisClient, buildCacheKey, redis } from "../config/redis.js";

export class AssetService {
    constructor(
        private prisma: PrismaClientType,
        private cache: RedisClient = new RedisClient(redis),
    ) {}

    async findAll(
        pagination: PaginationParamsType = PaginationParams.parse({}),
    ): Promise<AssetResponseType> {
        const cacheKey = buildCacheKey("assets:findAll:", pagination);

        const cachedResponse = await this.cache.get_json<AssetResponseType>(
            cacheKey,
            AssetResponse,
        );

        if (cachedResponse) {
            return cachedResponse;
        }
        const { skip, take, order } = pagination;

        const [assets, total] = await Promise.all([
            this.prisma.asset.findMany({
                skip: skip,
                take: take,
                orderBy: { createdAt: order },
            }),
            this.prisma.asset.count(),
        ]);

        if (!assets) {
            throw httpErrors.notFound("Assets not found");
        }

        const data = AssetResponse.parse({
            meta: { total },
            data: assets,
        });

        this.cache.set_json(cacheKey, data, 300).catch(console.error); // Cache for 5 minutes

        return data;
    }

    async findAllWithExtras(
        pagination: PaginationParamsType = PaginationParams.parse({}),
    ): Promise<AssetExtrasType[]> {
        const cacheKey = buildCacheKey("assets:findAllWithExtras:", pagination);

        const cachedAssets = await this.cache.get_json<AssetExtrasType[]>(
            cacheKey,
            AssetExtrasArray,
        );

        if (cachedAssets) {
            return cachedAssets;
        }
        const { skip, take, order } = pagination;

        const assets = await this.prisma.asset.findMany({
            skip: skip,
            take: take,
            orderBy: { createdAt: order },
        });

        const { success, data, error } = AssetExtrasArray.safeParse(assets);

        if (!success) {
            console.error(error);
            throw httpErrors.internalServerError("Invalid assets data");
        }

        this.cache.set_json(cacheKey, data, 300).catch(console.error); // Cache for 5 minutes

        return data;
    }

    async findById(id: number): Promise<AssetType> {
        const cacheKey = `asset:id:${id}`;
        const cachedAsset = await this.cache.get_json<AssetType>(cacheKey, Asset);

        if (cachedAsset) {
            return cachedAsset;
        }

        const asset = await this.prisma.asset.findUnique({ where: { id } });

        if (!asset) {
            throw httpErrors.notFound("Asset not found");
        }

        const { success, data, error } = Asset.safeParse(asset);

        if (!success) {
            console.error(error);
            throw httpErrors.notFound("Invalid asset data");
        }
        this.cache.set_json(cacheKey, data, 300).catch(console.error); // Cache for 5 minutes

        return data;
    }

    async findByIdWithExtras(id: number): Promise<AssetExtrasType> {
        const cacheKey = `asset:id:extras:${id}`;
        const cachedAsset = await this.cache.get_json<AssetExtrasType>(cacheKey, AssetExtras);

        if (cachedAsset) {
            return cachedAsset;
        }

        const asset = await this.prisma.asset.findUnique({ where: { id } });

        if (!asset) {
            throw httpErrors.notFound("Asset not found");
        }

        const { success, data, error } = AssetExtras.safeParse(asset);

        if (!success) {
            console.error(error);
            throw httpErrors.notFound("Invalid asset data");
        }

        this.cache.set_json(cacheKey, data, 300).catch(console.error); // Cache for 5 minutes

        return data;
    }

    async findBySymbol(symbol: string): Promise<AssetType> {
        const cacheKey = `asset:symbol:${symbol}`;
        const cachedAsset = await this.cache.get_json<AssetType>(cacheKey, Asset);

        if (cachedAsset) {
            return cachedAsset;
        }

        const asset = await this.prisma.asset.findUnique({ where: { symbol } });

        if (!asset) {
            throw httpErrors.notFound("Asset not found");
        }

        const { success, data, error } = Asset.safeParse(asset);

        if (!success) {
            console.error(error);
            throw httpErrors.notFound("Invalid asset data");
        }
        this.cache.set_json(cacheKey, data, 300).catch(console.error); // Cache for 5 minutes

        return data;
    }

    async findBySymbolWithExtras(symbol: string): Promise<AssetExtrasType> {
        const cacheKey = `asset:symbol:extras:${symbol}`;
        const cachedAsset = await this.cache.get_json<AssetExtrasType>(cacheKey, AssetExtras);

        if (cachedAsset) {
            return cachedAsset;
        }

        const asset = await this.prisma.asset.findUnique({ where: { symbol } });

        if (!asset) {
            throw httpErrors.notFound("Asset not found");
        }
        const { success, data, error } = AssetExtras.safeParse(asset);

        if (!success) {
            console.error(error);
            throw httpErrors.notFound("Invalid asset data");
        }

        this.cache.set_json(cacheKey, data, 300).catch(console.error); // Cache for 5 minutes

        return data;
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
        const cacheKey1 = `asset:id:${id}`;
        const cacheKey2 = `asset:id:extras:${id}`;

        const asset = await this.findById(id);

        this.cache.del(cacheKey1).catch(console.error);
        this.cache.del(cacheKey2).catch(console.error);

        this.cache.del(`asset:symbol:${asset.symbol}`).catch(console.error);
        this.cache.del(`asset:symbol:extras:${asset.symbol}`).catch(console.error);

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
