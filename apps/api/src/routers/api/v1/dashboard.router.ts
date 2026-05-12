import { StatusCodes } from "http-status-codes";
import { prisma } from "@repo/shared";
import { DashboardService } from "@repo/shared/services/dashboard.service";
import { DashboardResponse } from "@repo/shared/types/interfaces/dashboard.interface";
import type { FastifyInstanceTyped } from "../../../types/common.js";

export async function dashboardRoutes(app: FastifyInstanceTyped) {
    app.get(
        "/",
        {
            schema: {
                tags: ["Dashboard"],
                security: [],
                response: {
                    [StatusCodes.OK]: DashboardResponse,
                },
            },
        },
        async () => {
            return await new DashboardService(prisma).getDashboard();
        },
    );
}
