import type { FastifyInstance } from "fastify";
import { registerRoutes as registerV1Routes } from "./v1/index.js";

export async function registerApiRoutes(app: FastifyInstance) {
	app.register(registerV1Routes, { prefix: "/v1" });
}
