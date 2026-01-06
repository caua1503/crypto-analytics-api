import { httpErrors } from "@fastify/sensible";
import { z } from "zod";
import { Prisma } from "../../generated/prisma/client.js";
import type { PrismaClientType } from "../config/prisma.js";

import {
    Analysis,
    AnalysisCreate,
    type AnalysisCreateType,
    AnalysisEngineVersion,
    AnalysisEngineVersionCreate,
    type AnalysisEngineVersionCreateType,
    type AnalysisEngineVersionType,
    type AnalysisType,
    PaginatiomAnalysisEngineVersionParams,
    type PaginatiomAnalysisEngineVersionParamsType,
} from "../types/interfaces/analysis.interface.js";

import {
    PaginationParams,
    type PaginationParamsType,
} from "../types/interfaces/common.interface.js";

export class AnalysisService {
    constructor(private prisma: PrismaClientType) {}

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
        try {
            const { skip, take } = pagination;

            const analyses = await this.prisma.analysis.findMany({
                skip: skip,
                take: take,
                orderBy: { createdAt: "desc" },
            });

            if (!analyses) {
                //Retornar uma execeção http 404
                throw httpErrors.notFound("Analyses not found");
            }

            return analyses.map((analyses: any) => Analysis.parse(analyses));
        } catch (error) {
            console.error("Error fetching analyses:", error);
            throw httpErrors.internalServerError("Failed to fetch analyses");
        }
    }

    async findById(id: number): Promise<AnalysisType> {
        try {
            const analyses = await this.prisma.analysis.findUnique({ where: { id } });

            if (!analyses) {
                //Retornar uma execeção http 404
                throw httpErrors.notFound("Analyses not found");
            }

            return Analysis.parse(analyses);
        } catch (error) {
            console.error(`Error fetching analysis by ID (${id}): ${error}`);
            throw httpErrors.internalServerError("Failed to fetch analysis by ID");
        }
    }

    async findByAssetId(assetId: number): Promise<AnalysisType[]> {
        const analyses = await this.prisma.analysis.findMany({ where: { assetId } });
        return analyses.map((analysis: any) => Analysis.parse(analysis));
    }

    async delete(id: number): Promise<void> {
        try {
            await this.prisma.analysis.delete({ where: { id } });
        } catch (error) {
            console.error(`Error deleting analysis by ID (${id}): ${error}`);
            throw httpErrors.notFound("Analysis not found");
        }
    }

    async update(id: number, data: Partial<AnalysisCreateType>): Promise<AnalysisType> {
        try {
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
    constructor(private prisma: PrismaClientType) {}

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
        try {
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
                //Retornar uma execeção http 404
                throw httpErrors.notFound("No analysis engine versions found");
            }

            return versions.map((version: any) => AnalysisEngineVersion.parse(version));
        } catch (error) {
            console.error("Error fetching analysis engine versions:", error);
            throw httpErrors.internalServerError("Failed to fetch analysis engine versions");
        }
    }

    async findById(id: number): Promise<AnalysisEngineVersionType> {
        try {
            const version = await this.prisma.analysisEngineVersion.findUnique({ where: { id } });

            if (!version) {
                //Retornar uma execeção http 404
                throw httpErrors.notFound("Analysis engine version not found");
            }

            return AnalysisEngineVersion.parse(version);
        } catch (error) {
            console.error(`Error fetching analysis engine version by ID (${id}): ${error}`);
            throw httpErrors.internalServerError("Failed to fetch analysis engine version by ID");
        }
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
