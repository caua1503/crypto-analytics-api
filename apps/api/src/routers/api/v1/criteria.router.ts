import { z } from "zod";
import { prisma } from "@repo/shared";
import { FastifyInstanceTyped } from "../../../types/common.js";
import { CriterionCategory } from "@repo/shared/types/common";
import { StatusCodes } from "http-status-codes";
import { CriterionService } from "@repo/shared/services/criteria.service";
import { Criterion, CriterionCreate } from "@repo/shared/types/interfaces/criteria.interface";
import { IdSchema } from "@repo/shared/types/schemas/common.schemas";

export async function criterionRoutes(app: FastifyInstanceTyped) {
    app.get(
        "/",
        {
            schema: {
                tags: ["Criterion"],
                response: {
                    [StatusCodes.OK]: z.object({
                        criterions: z.array(Criterion),
                    }),
                },
            },
        },
        async (req, res) => {
            return { criterions: await new CriterionService(prisma).findAll() };
        },
    );
    app.get(
        "/:id",
        {
            schema: {
                tags: ["Criterion"],
                params: IdSchema,
                response: {
                    [StatusCodes.OK]: z.object({
                        criterion: Criterion,
                    }),
                },
            },
        },
        async (req, res) => {
            return { criterion: await new CriterionService(prisma).findById(req.params.id) };
        },
    );
    app.get(
        "/categories",
        {
            schema: {
                tags: ["Criterion"],
                response: {
                    [StatusCodes.OK]: z.object({
                        categories: z.array(CriterionCategory),
                    }),
                },
            },
        },
        async (req, res) => {
            return { categories: await new CriterionService(prisma).findAllCategories() };
        },
    );
    app.post(
        "/",
        {
            schema: {
                tags: ["Criterion"],
                body: CriterionCreate,
                response: {
                    [StatusCodes.CREATED]: Criterion,
                },
            },
        },
        async (req, res) => {
            return await new CriterionService(prisma).create(req.body);
        },
    );
    app.delete(
        "/:id",
        {
            schema: {
                tags: ["Criterion"],
                params: IdSchema,
            },
        },
        async (req, res) => {
            return await new CriterionService(prisma).delete(req.params.id);
        },
    );
    app.patch(
        "/:id",
        {
            schema: {
                tags: ["Criterion"],
                params: IdSchema,
                body: CriterionCreate.partial(),
                response: {
                    [StatusCodes.CREATED]: Criterion,
                },
            },
        },
        async (req, res) => {
            return await new CriterionService(prisma).update(req.params.id, req.body);
        },
    );
}
