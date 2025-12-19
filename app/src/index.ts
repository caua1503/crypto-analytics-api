import fastify from "fastify";

const app = fastify()

const PORT: number = 3000
const HOST: string = "0.0.0.0"

app.get('/', async (req, res) => {
    return {message: "ok"}
})

app.listen({port: PORT, host: HOST}).then(() => {
    console.log(`Funcionando na porta ${PORT}`)
}) 