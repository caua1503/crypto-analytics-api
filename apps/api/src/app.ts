import "dotenv/config";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import sensible from "@fastify/sensible";
import swagger from "@fastify/swagger";
import { hasAcess } from "@repo/shared/core/security";
import scalar from "@scalar/fastify-api-reference";
import fastify from "fastify";
import {
	jsonSchemaTransform,
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { env } from "./config/env.js";
import { registerAllRoutes } from "./routers/index.js";

export function buildApp() {
	const app = fastify().withTypeProvider<ZodTypeProvider>();

	app.setValidatorCompiler(validatorCompiler);
	app.setSerializerCompiler(serializerCompiler);

	app.register(cors, {
		origin: "*",
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
	});

	if (env.NODE_ENV !== "production") {
		app.register(swagger, {
			openapi: {
				info: {
					title: "crypto-analytics-api",
					description: "Uma API de análise de criptomoedas...",
					version: "1.0.0",
				},
				servers: [
					{
						url: "http://localhost:3000",
						description: "Development server",
					},
					{
						url: "http://localhost:3333",
						description: "Production server",
					},
				],
				security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
				components: {
					securitySchemes: {
						bearerAuth: {
							type: "http",
							scheme: "bearer",
							bearerFormat: "JWT",
						},
						apiKeyAuth: {
							type: "apiKey",
							in: "header",
							name: "x-api-key",
						},
					},
				},
			},
			transform: jsonSchemaTransform,
		});

		app.register(scalar, {
			routePrefix: "/docs",
			configuration: {
				layout: "modern",
				theme: "fastify",
				showSidebar: true,
			},
		});
	}

	app.register(sensible);

	app.register(jwt, {
		namespace: "access",
		secret: env.JWT_ACCESS_SECRET,
		sign: { expiresIn: "15m" },
	});

	app.register(jwt, {
		namespace: "refresh",
		secret: env.JWT_REFRESH_SECRET,
		sign: { expiresIn: "30D" },
	});

	app.addHook("preHandler", hasAcess({ rateLimit: { windowSeconds: 60, limit: 100 } }));

	app.register(registerAllRoutes);

	app.get("/", { config: { public: true }, schema: { security: [] } }, async (_req, _res) => {
		return { message: "go to /docs" };
	});

	app.get(
		"/health",
		{ config: { public: true }, schema: { security: [] } },
		async (_req, _res) => {
			return { message: "ok" };
		},
	);

	return app;
}
