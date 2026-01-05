import "dotenv/config";
import fastify, { FastifyInstance } from "fastify";
import sensible from '@fastify/sensible'
import { validatorCompiler, serializerCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';
import { env } from "./config/env.js";

// import { registerAllRoutes } from "./routers/index.js";

const app = fastify().withTypeProvider<ZodTypeProvider>();
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

const PORT: number = env.PORT
const HOST: string = env.HOST

// app.register(registerAllRoutes);

app.register(sensible)

app.get('/', async (req, res) => {
    return {message: "ok"}
})

app.listen({port: PORT, host: HOST}).then(() => {
    console.log(`Funcionando na porta ${PORT}`)
}) 