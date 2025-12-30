import fastify, { FastifyInstance } from "fastify";

const app: FastifyInstance = fastify()

const PORT: number = 3000
const HOST: string = "0.0.0.0"

app.get('/', async (req, res) => {
    return {message: "ok"}
})

app.listen({port: PORT, host: HOST}).then(() => {
    console.log(`Funcionando na porta ${PORT}`)
}) 