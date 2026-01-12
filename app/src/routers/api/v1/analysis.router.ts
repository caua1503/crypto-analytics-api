import { FastifyInstanceTyped } from "../../../types/common.js";
import { AnalysisService } from "../../../services/analysis.service.js";
import { prisma } from "../../../config/prisma.js";
import { AnalysisResponse } from "../../../types/interfaces/analysis.interface.js";
import { z } from "zod";
import { PaginationParams } from "../../../types/interfaces/common.interface.js";
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
