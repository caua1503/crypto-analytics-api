import type { FastifyInstance } from "fastify";
import { assetRoutes } from "./asset.router.js";
import { criterionRoutes } from "./criteria.router.js";
import { dashboardRoutes } from "./dashboard.router.js";
import { marketRoutes } from "./market.router.js";
import { userRoutes } from "./user.router.js";

export { assetRoutes, criterionRoutes, dashboardRoutes, marketRoutes, userRoutes };

export async function registerRoutes(app: FastifyInstance) {
	app.register(userRoutes, { prefix: "/user" });
	app.register(assetRoutes, { prefix: "/assets" });
	app.register(criterionRoutes, { prefix: "/criterion" });
	app.register(dashboardRoutes, { prefix: "/dashboard" });
	app.register(marketRoutes, { prefix: "/market" });
}
