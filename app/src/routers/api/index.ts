import { FastifyInstance } from "fastify";
import { registerRoutes as registerV1Routes } from "./v1/index.js";

export async function registerApiRoutes(app: FastifyInstance) {
	app.register(registerV1Routes, { prefix: "/v1" });
	// Futuras versões podem ser adicionadas aqui:
	// app.register(registerV2Routes, { prefix: '/v2' });
	// app.register(registerV3Routes, { prefix: '/v3' });
}
