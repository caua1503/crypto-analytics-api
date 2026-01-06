import { FastifyInstance } from "fastify";
import { assetRoutes } from "./asset.router.js";
import { criterionRoutes } from "./criteria.router.js";

export { assetRoutes };
export { criterionRoutes };

export async function registerRoutes(app: FastifyInstance) {
    app.register(assetRoutes, { prefix: "/assets" });
    app.register(criterionRoutes, { prefix: "/criterion" });
}
