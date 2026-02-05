import { z } from "zod";
import { FastifyInstanceTyped } from "../../../types/common.js";
import { AnalysisService } from "@repo/shared/services/analysis.service";
import { prisma } from "@repo/shared";
import { AnalysisResponse } from "@repo/shared/types/interfaces/analysis.interface";
import { PaginationParams } from "@repo/shared/types/interfaces/common.interface";
import { StatusCodes } from "http-status-codes";

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
