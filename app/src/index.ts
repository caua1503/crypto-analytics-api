import fastify, { FastifyInstance } from "fastify";
import { AssetService } from "./services/asset.service.js";
import { prisma } from "./config/prisma.js";


const app: FastifyInstance = fastify()

const PORT: number = 3000
const HOST: string = "0.0.0.0"

app.get('/', async (req, res) => {
    return {message: "ok"}
})


app.post('/asset', async (req, res) => {
    const assetService = new AssetService(prisma);
    await assetService.create(req.body);
    return {message: "post ok"}
})

app.listen({port: PORT, host: HOST}).then(() => {
    console.log(`Funcionando na porta ${PORT}`)
})