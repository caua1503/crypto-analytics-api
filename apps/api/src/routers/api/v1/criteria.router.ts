import { prisma } from "../../../config/prisma.js";
import { CriterionCategory, FastifyInstanceTyped } from "../../../types/common.js";
import { StatusCodes } from "http-status-codes";
import z from "zod";
import { CriterionService } from "../../../services/criteria.service.js";
import { Criterion, CriterionCreate } from "../../../types/interfaces/criteria.interface.js";
import { IdSchema } from "../../../types/schemas/common.schemas.js";

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
