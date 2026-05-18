import { heavyDispatcher } from "./dispatchers/heavy.dispatch";
import { registerDailyScheduler } from "./schedulers/daily.scheduler";

async function main() {
	await registerDailyScheduler();

	const dispatchers = [heavyDispatcher];

	console.log(`\n🚀 Scheduler running with ${dispatchers.length} active dispatchers\n`);
}

main().catch(console.error);
