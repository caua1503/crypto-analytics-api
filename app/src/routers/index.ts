import { FastifyInstance } from "fastify";
import { registerApiRoutes } from "./api/index.js";

export async function registerAllRoutes(app: FastifyInstance) {
    app.register(registerApiRoutes, { prefix: "/api" });
}
