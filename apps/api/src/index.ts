import { buildApp } from "./app.js";
import { env } from "./config/env.js";

const PORT: number = env.PORT;
const HOST: string = env.HOST;

const app = buildApp();

app.listen({ port: PORT, host: HOST }).then(() => {
	console.log(
		`\n🚀 Server is running at \n(http://${HOST}:${PORT})\n(http://localhost:${PORT})\n`,
	);
	if (env.NODE_ENV === "production") {
		console.log(`🔥 Running in mode: "${env.NODE_ENV}"`);
	} else {
		console.log(`📚 Running in mode: "${env.NODE_ENV}"`);
		console.log(`\n📚 Docs available at: http://localhost:${PORT}/docs`);
	}
});
