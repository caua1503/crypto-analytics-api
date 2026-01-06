import { httpErrors } from "@fastify/sensible";
import { ca } from "zod/locales";
import type { PrismaClientType } from "../config/prisma.js";
import { CriterionCategory, type CriterionCategoryType } from "../types/common.js";
import {
    Criterion,
    CriterionCreate,
    type CriterionCreateType,
    type CriterionType,
    CriterionWeight,
    CriterionWeightCreate,
    type CriterionWeightCreateType,
    type CriterionWeightType,
} from "../types/interfaces/criteria.interface.js";

export class CriterionService {
    constructor(private prisma: PrismaClientType) {}

    async findAllCategories(): Promise<CriterionCategoryType[]> {
        return CriterionCategory.options;
    }

    async findAll(): Promise<CriterionType[]> {
        try {
            const criterions = await this.prisma.criterion.findMany();

            if (!criterions) {
                throw httpErrors.notFound("No criterions found");
            }

            return criterions.map((criterions) => Criterion.parse(criterions));
        } catch (error) {
            throw httpErrors.internalServerError("Error retrieving criterions");
        }
    }

    async findById(id: number): Promise<CriterionType> {
        try {
            const criterion = await this.prisma.criterion.findUnique({
                where: { id },
            });

            if (!criterion) {
                throw httpErrors.notFound("Criterion not found");
            }
            return Criterion.parse(criterion);
        } catch (error) {
            throw httpErrors.internalServerError("Error retrieving criterion");
        }
    }

    async create(data: CriterionCreateType): Promise<CriterionType> {
        try {
            const validatedData = CriterionCreate.parse(data);
            return await this.prisma.criterion.create({ data: validatedData });
        } catch (error) {
            throw httpErrors.badRequest("Invalid criterion data");
        }
    }

    async update(id: number, data: Partial<CriterionCreateType>): Promise<CriterionType> {
        try {
            const validatedData = CriterionCreate.partial().parse(data);
            return await this.prisma.criterion.update({ where: { id }, data: validatedData });
        } catch (error) {
            throw httpErrors.badRequest("Invalid criterion data");
        }
    }

    async delete(id: number): Promise<void> {
        try {
            await this.prisma.criterion.delete({ where: { id } });
        } catch (error) {
            throw httpErrors.notFound("Criterion not found");
        }
    }
}

export class CriterionWeightService {
    constructor(private prisma: PrismaClientType) {}

    async findById(id: number): Promise<CriterionWeightType> {
        try {
            const criterionWeight = await this.prisma.criterionWeight.findUnique({
                where: { id },
            });

            if (!criterionWeight) {
                throw httpErrors.notFound("Criterion weight not found");
            }
            return CriterionWeight.parse(criterionWeight);
        } catch (error) {
            throw httpErrors.internalServerError("Error retrieving criterion weight");
        }
    }

    async create(data: CriterionWeightCreateType): Promise<CriterionWeightType> {
        try {
            const validatedData = CriterionWeightCreate.parse(data);
            const criterionWeight = await this.prisma.criterionWeight.create({
                data: validatedData,
            });

            return CriterionWeight.parse(criterionWeight);
        } catch (error) {
            throw httpErrors.badRequest("Invalid criterion weight data");
        }
    }

    async update(
        id: number,
        data: Partial<CriterionWeightCreateType>,
    ): Promise<CriterionWeightType> {
        try {
            const validatedData = CriterionWeightCreate.partial().parse(data);
            const criterionWeight = await this.prisma.criterionWeight.update({
                where: { id },
                data: validatedData,
            });

            return CriterionWeight.parse(criterionWeight);
        } catch (error) {
            throw httpErrors.badRequest("Invalid criterion weight data");
        }
    }

    async delete(id: number): Promise<void> {
        try {
            await this.prisma.criterionWeight.delete({ where: { id } });
        } catch (error) {
            throw httpErrors.notFound("Criterion weight not found");
        }
    }
}
