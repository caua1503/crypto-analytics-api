export class Logger {
	private context: string;

	constructor(context: string) {
		this.context = context;
	}

	log(message: string, ...args: unknown[]) {
		// [TIMESTAMP] [CONTEXT] Message
		const timestamp = new Date().toISOString();
		console.log(`[${timestamp}] [${this.context}] ${message}`, ...args);
	}

	error(message: string, error?: unknown) {
		const timestamp = new Date().toISOString();
		console.error(`[${timestamp}] [${this.context}] ERROR: ${message}`, error || "");
	}
}
