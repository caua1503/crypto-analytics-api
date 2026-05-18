import type { FastifyInstance } from "fastify";
import { registerApiRoutes } from "./api/index.js";
import { registerAuthRoutes } from "./auth/index.js";

export async function registerAllRoutes(app: FastifyInstance) {
	app.register(registerAuthRoutes, { prefix: "/auth" });
	app.register(registerApiRoutes, { prefix: "/api" });
}
