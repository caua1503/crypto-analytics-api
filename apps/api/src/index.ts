import "dotenv/config";
import fastify from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import jwt from "@fastify/jwt";
import scalar from "@scalar/fastify-api-reference";
import { hasAcess } from "@repo/shared/core/security";
import { getMarketDataService } from "@repo/shared/integrations";
import sensible from "@fastify/sensible";

import {
    validatorCompiler,
    serializerCompiler,
    ZodTypeProvider,
    jsonSchemaTransform,
} from "fastify-type-provider-zod";
import { env } from "./config/env.js";

import { registerAllRoutes } from "./routers/index.js";

const PORT: number = env.PORT;
// const PORT: number = 3001;
const HOST: string = env.HOST;

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(cors, {
    origin: "*", // Allows all origins
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Specify allowed methods
});

if (env.NODE_ENV !== "production") {
    app.register(swagger, {
        openapi: {
            info: {
                title: "crypto-analytics-api",
                description: "Uma API de análise de criptomoedas...",
                version: "1.0.0",
            },
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

app.register(registerAllRoutes);

// @ts-ignore
app.register(sensible);

app.register(jwt, {
    namespace: "access",
    secret: env.JWT_ACCESS_SECRET,
    sign: { expiresIn: "15m" },
});

app.register(jwt, {
    namespace: "refresh",
    secret: env.JWT_REFRESH_SECRET,
});

app.addHook("preHandler", hasAcess({}));

app.get("/", async (req, res) => {
    return { message: "go to /docs" };
});

app.get("/health", async (req, res) => {
    return { message: "ok" };
});

//Inicialisa a integração de dados de mercado
// getMarketDataService();

// const service = getMarketDataService();
// service.fetchOHLCById(1).then((result) => {
//     console.log("OHLC Data:", result);
// });

app.listen({ port: PORT, host: HOST }).then(() => {
    console.log(
        `\n🚀 Server is running at \n(http://${HOST}:${PORT})\n(http://localhost:${PORT})\n`,
    );
    console.log(`\n📚 Docs available at: http://localhost:${PORT}/docs`);
    if (env.NODE_ENV === "production") {
        console.log(`🔥 Running in mode: "${env.NODE_ENV}"`);
    } else {
        console.log(`📚 Running in mode: "${env.NODE_ENV}"`);
    }
});
