import { prisma } from "@repo/shared";
import { CriterionService } from "@repo/shared/services/criteria.service";
import { CriterionCategory } from "@repo/shared/types/common";
import { Criterion, CriterionCreate } from "@repo/shared/types/interfaces/criteria.interface";
import { IdSchema } from "@repo/shared/types/schemas/common.schemas";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import type { FastifyInstanceTyped } from "../../../types/common.js";

const criterionService = new CriterionService(prisma);

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
		async () => {
			return { criterions: await criterionService.findAll() };
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
		async (req) => {
			return { criterion: await criterionService.findById(req.params.id) };
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
		async () => {
			return { categories: await criterionService.findAllCategories() };
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
		async (req) => {
			return await criterionService.create(req.body);
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
		async (req) => {
			return await criterionService.delete(req.params.id);
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
		async (req) => {
			return await criterionService.update(req.params.id, req.body);
		},
	);
}
