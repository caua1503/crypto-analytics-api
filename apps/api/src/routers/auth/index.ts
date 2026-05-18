import type { FastifyInstance } from "fastify";
import { registerAuthRoutes as registerAuthRoutesV1 } from "./v1/index.js";

export async function registerAuthRoutes(app: FastifyInstance) {
    app.register(registerAuthRoutesV1, { prefix: "/v1" });
}
