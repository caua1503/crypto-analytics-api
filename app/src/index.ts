import "dotenv/config";
import fastify, { FastifyInstance } from "fastify";
import sensible from '@fastify/sensible'
import { validatorCompiler, serializerCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';

import { registerAllRoutes } from "./routers/index.js";


const app = fastify().withTypeProvider<ZodTypeProvider>();
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

const PORT: number = 3000
const HOST: string = "0.0.0.0"

app.register(registerAllRoutes);
app.register(sensible)

app.get('/', async (req, res) => {
    return {message: "ok"}
})


app.listen({port: PORT, host: HOST}).then(() => {
    console.log(`Funcionando na porta ${PORT}`)
}) 