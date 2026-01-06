import { FastifyInstanceTyped } from "../../../types/common.js";
import { AnalysisService } from "../../../services/analysis.service.js";
import { prisma } from "../../../config/prisma.js";

export async function analysisRouter(app: FastifyInstanceTyped) {
    app.get("/", async (req, res) => {
        return { analyses: await new AnalysisService(prisma).findAll() };
    });
}
