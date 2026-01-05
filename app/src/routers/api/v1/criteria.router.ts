import { prisma } from "../../../config/prisma.js";
import { FastifyInstanceTyped } from "../../../types/common.js";

import { CriterionService } from "../../../services/criteria.service.js";

export async function criterionRoutes(app: FastifyInstanceTyped) {
	app.get("/categories", async (req, res) => {
		return { categories: await new CriterionService(prisma).findAllCategories() };
	});
}
