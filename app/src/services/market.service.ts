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

export class MarketSnapshotService {
    constructor(private prisma: PrismaClientType) {}

    async findAll(
        assetId: number,
        pagination: PaginationParamsType = PaginationParams.parse({}),
    ): Promise<MarketSnapshotType[]> {
        const { skip, take, order } = pagination;
        const snapshots = await this.prisma.marketSnapshot.findMany({
            where: { assetId: assetId },
            skip: skip,
            take: take,
            orderBy: { createdAt: order },
        });
        if (!snapshots) {
            throw httpErrors.notFound("No market snapshots found");
        }
        return MarketSnapshotArray.parse(snapshots);
    }

    async findById(id: number): Promise<MarketSnapshotType> {
        const marketsnapshot = await this.prisma.marketSnapshot.findFirst({
            where: { id },
            orderBy: { createdAt: "desc" },
        });
        if (!marketsnapshot) {
            throw httpErrors.notFound("Market snapshot not found");
        }

        return MarketSnapshot.parse(marketsnapshot);
    }

    async getLatestSnapshotByAssetId(assetId: number): Promise<MarketSnapshotType> {
        const marketsnapshot = await this.prisma.marketSnapshot.findFirst({
            where: { assetId: assetId },
            orderBy: { createdAt: "desc" },
        });
        if (!marketsnapshot) {
            throw httpErrors.notFound("Market snapshot not found");
        }
        return MarketSnapshot.parse(marketsnapshot);
    }

    async getLatestSnapshotBySymbol(symbol: string): Promise<MarketSnapshotType> {
        const { id } = await new AssetService(this.prisma).findBySymbol(symbol);
        return await this.getLatestSnapshotByAssetId(id);
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
