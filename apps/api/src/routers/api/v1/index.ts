import { FastifyInstance } from "fastify";
import { assetRoutes } from "./asset.router.js";
import { criterionRoutes } from "./criteria.router.js";
import { marketRoutes } from "./market.router.js";
import { userRoutes } from "./user.router.js";

export { assetRoutes };
export { criterionRoutes };
export { marketRoutes };
export { userRoutes };

export async function registerRoutes(app: FastifyInstance) {
    app.register(userRoutes, { prefix: "/user" });
    app.register(assetRoutes, { prefix: "/assets" });
    app.register(criterionRoutes, { prefix: "/criterion" });
    app.register(marketRoutes, { prefix: "/market" });
}
