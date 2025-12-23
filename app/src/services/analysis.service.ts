import { z } from 'zod';

import { 
    Analysis, 
    AnalysisType, 
    AnalysisCreate, 
    AnalysisCreateType, 
    AnalysisEngineVersion, 
    AnalysisEngineVersionType, 
    AnalysisEngineVersionCreate, 
    AnalysisEngineVersionCreateType,
    PaginatiomAnalysisEngineVersionParams,
    PaginatiomAnalysisEngineVersionParamsType
} from "../interfaces/analysis.interface.js";

import { PaginationParams, PaginationParamsType } from "../interfaces/common.interface.js";

export class AnalysisService {
    constructor(private prisma: any) {}
    
    async create(data: AnalysisCreateType): Promise<AnalysisType> {
        const validatedData = AnalysisCreate.parse(data);
        return this.prisma.analysis.create({data: validatedData});
    }

    async findAll(pagination: PaginationParamsType = PaginationParams.parse({})): Promise<AnalysisType[] | null> {

        const { skip, take } = pagination;

        const analyses = await this.prisma.analysis.findMany({
            skip: skip,
            take: take,
            orderBy: { createdAt: 'desc' },
        });

        if (!analyses) {
            //Retornar uma execeção http 404
            return null;
        }

        return analyses.map((analyses: any) => Analysis.parse(analyses));
    }

    async findById(id: number): Promise<AnalysisType | null> {
        const analyses = await this.prisma.analysis.findUnique({where: {id}});
        
        if (!analyses) {
            //Retornar uma execeção http 404
            return null;
        }

        return Analysis.parse(analyses);
    }

    async findByAssetId(assetId: number): Promise<AnalysisType[]> {
        const analyses = await this.prisma.analysis.findMany({where: {assetId}});
        return analyses.map((analysis: any) => Analysis.parse(analysis));
    }

    async delete(id: number): Promise<void> {
        await this.prisma.analysis.delete({where: {id}});
    }

    async update(id: number, data: Partial<AnalysisCreateType>): Promise<AnalysisType> {
        const validatedData = AnalysisCreate.partial().parse(data);
        const updatedAnalysis = await this.prisma.analysis.update({
            where: {id},
            data: validatedData,
        });
        return Analysis.parse(updatedAnalysis);
    }
}

export class AnalysisEngineVersionService {
    constructor(private prisma: any) {}

    async create(data: AnalysisEngineVersionCreateType): Promise<AnalysisEngineVersionType> {
        const validatedData = AnalysisEngineVersionCreate.parse(data);
        return this.prisma.analysisEngineVersion.create({data: validatedData});}

    async findAll(pagination: PaginatiomAnalysisEngineVersionParamsType = PaginatiomAnalysisEngineVersionParams.parse({})): Promise<AnalysisEngineVersionType[] | null> {
        const { skip, take, isActive} = pagination;

        const versions = await this.prisma.analysisEngineVersion.findMany({
            skip: skip,
            take: take,
            orderBy: { createdAt: 'desc' },
            where: {
                ...(isActive !== undefined && { isActive }),
            },
        });

        if (!versions) {
            //Retornar uma execeção http 404
            return null;
        }

        return versions.map((version: any) => AnalysisEngineVersion.parse(version));
    }    

    async findById(id: number): Promise<AnalysisEngineVersionType | null> {
        const version = await this.prisma.analysisEngineVersion.findUnique({where: {id}});
        
        if (!version) {
            //Retornar uma execeção http 404
            return null;
        }

        return AnalysisEngineVersion.parse(version);
    }

    async delete(id: number): Promise<void> {
        await this.prisma.analysisEngineVersion.delete({where: {id}});
    }

    async update(id: number, data: Partial<AnalysisEngineVersionCreateType>): Promise<AnalysisEngineVersionType> {
        const validatedData = AnalysisEngineVersionCreate.partial().parse(data);
        const updatedVersion = await this.prisma.analysisEngineVersion.update({
            where: {id},
            data: validatedData,
        });
        return AnalysisEngineVersion.parse(updatedVersion);
    }
}