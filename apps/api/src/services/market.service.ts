import type { PrismaClientType } from "../config/prisma.js";
import { httpErrors } from "@fastify/sensible";
import {
    type PaginationParamsType,
    PaginationParams,
} from "../types/interfaces/common.interface.js";
import {
    MarketSnapshot,
    MarketSnapshotArray,
    MarketSnapshotCreate,
    MarketSnapshotCreateType,
    MarketSnapshotType,
} from "../types/interfaces/market.interface.js";
import { AssetService } from "./asset.service.js";
import { z } from "zod";
import { RedisClient, buildCacheKey, redis } from "../config/redis.js";

export class MarketSnapshotService {
    constructor(
        private prisma: PrismaClientType,
        private cache: RedisClient = new RedisClient(redis),
    ) {}

    async findAllBySymbol(
        symbol: string,
        pagination: PaginationParamsType = PaginationParams.parse({}),
    ): Promise<MarketSnapshotType[]> {
        const cacheKey = buildCacheKey("marketsnapshots:findAll:symbol:", {
            symbol,
            ...pagination,
        });

        const cachedSnapshots = await new RedisClient(redis).get_json<MarketSnapshotType[]>(
            cacheKey,
            MarketSnapshotArray,
        );

        if (cachedSnapshots) {
            return cachedSnapshots;
        }
        const { id } = await new AssetService(this.prisma).findBySymbol(symbol);

        const { skip, take, order } = pagination;
        const snapshots = await this.prisma.marketSnapshot.findMany({
            where: { assetId: id },
            skip: skip,
            take: take,
            orderBy: { createdAt: order },
        });

        if (!snapshots) {
            throw httpErrors.notFound("No market snapshots found");
        }

        const { success, data, error } = MarketSnapshotArray.safeParse(snapshots);

        if (!success) {
            console.error(error);
            throw httpErrors.internalServerError("Invalid market snapshots data");
        }

        this.cache.set_json(cacheKey, data);

        return data;
    }

    async findAllByPublicID(
        publicId: string,
        pagination: PaginationParamsType = PaginationParams.parse({}),
    ): Promise<MarketSnapshotType[]> {
        const cacheKey = buildCacheKey("marketsnapshots:findAll:publicId:", {
            publicId,
            ...pagination,
        });

        const cachedSnapshots = await new RedisClient(redis).get_json<MarketSnapshotType[]>(
            cacheKey,
            MarketSnapshotArray,
        );

        if (cachedSnapshots) {
            return cachedSnapshots;
        }
        const { id } = await new AssetService(this.prisma).findByPublicId(publicId);
        const { skip, take, order } = pagination;
        const snapshots = await this.prisma.marketSnapshot.findMany({
            where: { assetId: id },
            skip: skip,
            take: take,
            orderBy: { createdAt: order },
        });

        if (!snapshots) {
            throw httpErrors.notFound("No market snapshots found");
        }

        const { success, data, error } = MarketSnapshotArray.safeParse(snapshots);

        if (!success) {
            console.error(error);
            throw httpErrors.internalServerError("Invalid market snapshots data");
        }

        this.cache.set_json(cacheKey, data);

        return data;
    }

    async findById(id: number): Promise<MarketSnapshotType> {
        const cacheKey = `marketsnapshots:findById:${id}`;

        const cachedSnapshot = await this.cache.get_json<MarketSnapshotType>(
            cacheKey,
            MarketSnapshot,
        );

        if (cachedSnapshot) {
            return cachedSnapshot;
        }

        const marketsnapshot = await this.prisma.marketSnapshot.findFirst({
            where: { id },
            orderBy: { createdAt: "desc" },
        });

        if (!marketsnapshot) {
            throw httpErrors.notFound("Market snapshot not found");
        }

        const { success, data, error } = MarketSnapshot.safeParse(marketsnapshot);

        if (!success) {
            console.error(error);
            throw httpErrors.internalServerError("Invalid market snapshot data");
        }

        this.cache.set_json(cacheKey, data);

        return data;
    }

    async getLatestSnapshotByPublicId(PublicId: string): Promise<MarketSnapshotType> {
        const cacheKey = `marketsnapshots:latest:${PublicId}`;

        const cachedSnapshot = await this.cache.get_json<MarketSnapshotType>(
            cacheKey,
            MarketSnapshot,
        );

        if (cachedSnapshot) {
            return cachedSnapshot;
        }
        const { id } = await new AssetService(this.prisma).findByPublicId(PublicId);
        const marketsnapshot = await this.prisma.marketSnapshot.findFirst({
            where: { assetId: id },
            orderBy: { createdAt: "desc" },
        });

        if (!marketsnapshot) {
            throw httpErrors.notFound("Market snapshot not found");
        }
        const { success, data, error } = MarketSnapshot.safeParse(marketsnapshot);

        if (!success) {
            console.error(error);
            throw httpErrors.internalServerError("Invalid market snapshot data");
        }

        this.cache.set_json(cacheKey, data);

        return data;
    }

    async getLatestSnapshotBySymbol(symbol: string): Promise<MarketSnapshotType> {
        const cacheKey = `marketsnapshots:latest:symbol:${symbol}`;

        const cachedSnapshot = await this.cache.get_json<MarketSnapshotType>(
            cacheKey,
            MarketSnapshot,
        );

        if (cachedSnapshot) {
            return cachedSnapshot;
        }
        try {
            const { publicId } = await new AssetService(this.prisma).findBySymbol(symbol);
            return await this.getLatestSnapshotByPublicId(publicId);
        } catch (error) {
            console.error(error);
            throw httpErrors.internalServerError(
                "Failed to fetch latest market snapshot by symbol",
            );
        }
    }

    async create(data: MarketSnapshotCreateType): Promise<MarketSnapshotType> {
        try {
            const validatedData = MarketSnapshotCreate.parse(data);
            const newSnapshot = await this.prisma.marketSnapshot.create({
                data: validatedData,
            });
            return MarketSnapshot.parse(newSnapshot);
        } catch (error) {
            throw httpErrors.badRequest("Invalid market snapshot data");
        }
    }

    async update(id: number, data: Partial<MarketSnapshotCreateType>): Promise<MarketSnapshotType> {
        try {
            const validatedData = MarketSnapshotCreate.partial().parse(data);
            const updatedSnapshot = await this.prisma.marketSnapshot.update({
                where: { id },
                data: validatedData,
            });
            return MarketSnapshot.parse(updatedSnapshot);
        } catch (error) {
            throw httpErrors.badRequest("Invalid market snapshot data");
        }
    }
    async delete(id: number): Promise<void> {
        try {
            await this.prisma.marketSnapshot.delete({ where: { id } });
        } catch (error) {
            throw httpErrors.notFound("Market snapshot not found");
        }
    }
}
