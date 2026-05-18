import { prisma } from "@repo/shared";
import { AnalysisService } from "@repo/shared/services/analysis.service";
import { AnalysisResponse } from "@repo/shared/types/interfaces/analysis.interface";
import { PaginationParams } from "@repo/shared/types/interfaces/common.interface";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import type { FastifyInstanceTyped } from "../../../types/common.js";

export async function analysisRouter(app: FastifyInstanceTyped) {
	app.get(
		"/",
		{
			schema: {
				querystring: PaginationParams,
				response: {
					[StatusCodes.OK]: z.object({
						analyses: z.array(AnalysisResponse),
					}),
				},
			},
		},
		async (req) => {
			return { analyses: await new AnalysisService(prisma).findAll(req.query) };
		},
	);
}
