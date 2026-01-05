import "dotenv/config";
import fastify, { FastifyInstance } from "fastify";
import sensible from '@fastify/sensible'
import { validatorCompiler, serializerCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';
import { env } from "./config/env.js";
import { CoinGeckoService } from "./core/integrations.js";
console.log(env, "\n")

import { registerAllRoutes } from "./routers/index.js";


const app = fastify().withTypeProvider<ZodTypeProvider>();
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

const PORT: number = env.PORT
const HOST: string = env.HOST

// const coinGeckoService = new CoinGeckoService()

// coinGeckoService.fetchMarketData("solana").then((data) => {
//     console.log("Dados do Bitcoin buscados com sucesso")
// }).catch((error) => {
//     console.error("Erro ao buscar dados do Bitcoin:", error)
// })

app.register(registerAllRoutes);
app.register(sensible)

app.get('/', async (req, res) => {
    return {message: "ok"}
})


app.listen({port: PORT, host: HOST}).then(() => {
    console.log(`Funcionando na porta ${PORT}`)
}) 