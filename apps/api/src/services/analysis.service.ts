import { httpErrors } from "@fastify/sensible";
import { z } from "zod";
import { Prisma } from "../../generated/prisma/client.js";
import type { PrismaClientType } from "../config/prisma.js";

import {
    Analysis,
    type AnalysisType,
    AnalysisCreate,
    type AnalysisCreateType,
    AnalysisEngineVersion,
    AnalysisEngineVersionCreate,
    AnalysisArray,
    AnalysisEngineVersionArray,
    type AnalysisArrayType,
    type AnalysisEngineVersionCreateType,
    type AnalysisEngineVersionType,
    PaginatiomAnalysisEngineVersionParams,
    type PaginatiomAnalysisEngineVersionParamsType,
} from "../types/interfaces/analysis.interface.js";

import {
    PaginationParams,
    type PaginationParamsType,
} from "../types/interfaces/common.interface.js";
import { RedisClient, buildCacheKey, redis } from "../config/redis.js";

export class AnalysisService {
    constructor(
        private prisma: PrismaClientType,
        private cache: RedisClient = new RedisClient(redis),
    ) {}

    async create(data: AnalysisCreateType): Promise<AnalysisType> {
        try {
            const validatedData = AnalysisCreate.parse(data);

            const analysis = await this.prisma.analysis.create({ data: validatedData });

            return Analysis.parse(analysis);
        } catch (error) {
            console.error("Error creating analysis:", error);
            throw httpErrors.internalServerError("Failed to create analysis");
        }
    }

    async findAll(
        pagination: PaginationParamsType = PaginationParams.parse({}),
    ): Promise<AnalysisType[]> {
        const cacheKey = buildCacheKey("analyses:findAll:", pagination);

        const cachedAnalyses = await this.cache.get_json<AnalysisType[]>(cacheKey, AnalysisArray);

        if (cachedAnalyses) {
            return cachedAnalyses;
        }
        const { skip, take, order } = pagination;

        const analyses = await this.prisma.analysis.findMany({
            skip: skip,
            take: take,
            orderBy: { createdAt: order },
        });

        if (!analyses) {
            throw httpErrors.notFound("Analyses not found");
        }

        const { success, data, error } = AnalysisArray.safeParse(analyses);

        if (!success) {
            console.error(error);
            throw httpErrors.internalServerError("Invalid analyses data");
        }

        return data;
    }

    async findById(id: number): Promise<AnalysisType> {
        const cacheKey = `analyses:findById:${id}`;

        const cachedAnalyses = await this.cache.get_json<AnalysisType>(cacheKey, Analysis);

        if (cachedAnalyses) {
            return cachedAnalyses;
        }

        const analyses = await this.prisma.analysis.findUnique({ where: { id } });

        if (!analyses) {
            throw httpErrors.notFound("Analyses not found");
        }

        const { success, data, error } = Analysis.safeParse(analyses);

        if (!success) {
            console.error(error);
            throw httpErrors.internalServerError("Invalid analyses data");
        }

        return data;
    }

    async findByAssetId(assetId: number): Promise<AnalysisType[]> {
        const cacheKey = `analyses:findByAssetId:${assetId}`;

        const cachedAnalyses = await this.cache.get_json<AnalysisType[]>(cacheKey, AnalysisArray);

        if (cachedAnalyses) {
            return cachedAnalyses;
        }
        const analyses = await this.prisma.analysis.findMany({ where: { assetId } });

        if (!analyses) {
            throw httpErrors.notFound("Analyses not found");
        }

        const { success, data, error } = AnalysisArray.safeParse(analyses);

        if (!success) {
            console.error(error);
            throw httpErrors.internalServerError("Invalid analyses data");
        }

        return data;
    }

    async delete(id: number): Promise<void> {
        try {
            this.cache.del(`analyses:findById:${id}`);
            await this.prisma.analysis.delete({ where: { id } });
        } catch (error) {
            console.error(`Error deleting analysis by ID (${id}): ${error}`);
            throw httpErrors.notFound("Analysis not found");
        }
    }

    async update(id: number, data: Partial<AnalysisCreateType>): Promise<AnalysisType> {
        try {
            this.cache.del(`analyses:findById:${id}`);
            const validatedData = AnalysisCreate.partial().parse(data);
            const updatedAnalysis = await this.prisma.analysis.update({
                where: { id },
                data: validatedData,
            });
            return Analysis.parse(updatedAnalysis);
        } catch (error) {
            console.error(`Error updating analysis by ID (${id}): ${error}`);
            throw httpErrors.internalServerError("Failed to update analysis");
        }
    }
}

export class AnalysisEngineVersionService {
    constructor(
        private prisma: PrismaClientType,
        private cache: RedisClient = new RedisClient(redis),
    ) {}

    async create(data: AnalysisEngineVersionCreateType): Promise<AnalysisEngineVersionType> {
        try {
            const validatedData = AnalysisEngineVersionCreate.parse(data);
            return this.prisma.analysisEngineVersion.create({ data: validatedData });
        } catch (error) {
            console.error("Error creating analysis engine version:", error);
            throw httpErrors.internalServerError("Failed to create analysis engine version");
        }
    }

    async findAll(
        pagination: PaginatiomAnalysisEngineVersionParamsType = PaginatiomAnalysisEngineVersionParams.parse(
            {},
        ),
    ): Promise<AnalysisEngineVersionType[]> {
        const cacheKey = buildCacheKey("analysisEngineVersions:findAll:", pagination);

        const cachedVersions = await this.cache.get_json<AnalysisEngineVersionType[]>(
            cacheKey,
            AnalysisEngineVersionArray,
        );

        if (cachedVersions) {
            return cachedVersions;
        }
        const { skip, take, isActive } = pagination;

        const versions = await this.prisma.analysisEngineVersion.findMany({
            skip: skip,
            take: take,
            orderBy: { createdAt: "desc" },
            where: {
                ...(isActive !== undefined && { isActive }),
            },
        });

        if (!versions) {
            throw httpErrors.notFound("No analysis engine versions found");
        }

        const { success, data, error } = AnalysisEngineVersionArray.safeParse(versions);

        if (!success) {
            console.error(error);
            throw httpErrors.internalServerError("Invalid analysis engine versions data");
        }

        this.cache.set_json(cacheKey, data);

        return data;
    }

    async findById(id: number): Promise<AnalysisEngineVersionType> {
        const cacheKey = `analysisEngineVersions:findById:${id}`;

        const cachedVersion = await this.cache.get_json<AnalysisEngineVersionType>(
            cacheKey,
            AnalysisEngineVersion,
        );

        if (cachedVersion) {
            return cachedVersion;
        }

        const version = await this.prisma.analysisEngineVersion.findUnique({ where: { id } });

        if (!version) {
            throw httpErrors.notFound("Analysis engine version not found");
        }

        const { success, data, error } = AnalysisEngineVersion.safeParse(version);

        if (!success) {
            console.error(error);
            throw httpErrors.internalServerError("Invalid analysis engine version data");
        }

        this.cache.set_json(cacheKey, data);

        return data;
    }

    async delete(id: number): Promise<void> {
        try {
            await this.prisma.analysisEngineVersion.delete({ where: { id } });
        } catch (error) {
            console.error(`Error deleting analysis engine version by ID (${id}): ${error}`);
            throw httpErrors.notFound("Analysis engine version not found");
        }
    }

    async update(
        id: number,
        data: Partial<AnalysisEngineVersionCreateType>,
    ): Promise<AnalysisEngineVersionType> {
        try {
            const validatedData = AnalysisEngineVersionCreate.partial().parse(data);
            const updatedVersion = await this.prisma.analysisEngineVersion.update({
                where: { id },
                data: validatedData,
            });
            return AnalysisEngineVersion.parse(updatedVersion);
        } catch (error) {
            console.error(`Error updating analysis engine version by ID (${id}): ${error}`);
            throw httpErrors.internalServerError("Failed to update analysis engine version");
        }
    }
}
