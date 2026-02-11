import { registerDailyScheduler } from "./schedulers/daily.scheduler";
import { heavyDispatcher } from "./dispatchers/heavy.dispatch";

async function main() {
  await registerDailyScheduler();

  const dispatchers = [
    heavyDispatcher
  ];

  console.log(`\n🚀 Scheduler running with ${dispatchers.length} active dispatchers\n`);
}



main().catch(console.error);
