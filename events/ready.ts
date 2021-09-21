import { linkCommands, linkSlashCommands } from "../globals";
import { version } from "../package.json";
import type { Event } from "../types/event";

const ready: Event<"void"> = {
	name: "ready",
	once: true,
	callback: async () => {
		await linkCommands().catch(console.log);
		await linkSlashCommands().catch(console.log);
		console.log(`Client is ready, running version: ${version}`);
	},
};

export default ready;
