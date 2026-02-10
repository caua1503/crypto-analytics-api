import "dotenv/config";
import fastify from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
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
const HOST: string = env.HOST;

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(cors, {
    origin: "*", // Allows all origins
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Specify allowed methods
});

app.register(swagger, {
    openapi: {
        info: {
            title: "crypto-analytics-api",
            description:
                "Uma API de análise de criptomoedas que combina indicadores técnicos, sentimento de mercado e dados macroeconômicos para gerar recomendações objetivas e baseadas em dados.",
            version: "1.0.0",
        },
    },
    transform: jsonSchemaTransform,
});

app.register(swaggerUI, {
    routePrefix: "/docs",
});

app.register(registerAllRoutes);

app.register(sensible);

app.get("/", async (req, res) => {
    return { message: "go to /docs" };
});

app.get("/health", async (req, res) => {
    return { message: "ok" };
});

//Inicialisa a integração de dados de mercado
// getMarketDataService();

// const service = getMarketDataService();
// service.fetchMacroData().then((result) => {
//     console.log("Macro Data:", result);
// });

app.listen({ port: PORT, host: HOST }).then(() => {
    console.log(
        `\n🚀 Server is running at \n(http://${HOST}:${PORT})\n(http://localhost:${PORT})\n`,
    );
    console.log(`\n📚 Docs available at: http://localhost:${PORT}/docs`);
    if (env.NODE_ENV === "production") {
        console.log(`🔥 Running in mode: "${env.NODE_ENV}"`);
    }
    else {
        console.log(`📚 Running in mode: "${env.NODE_ENV}"`);
    }
});
