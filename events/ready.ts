import { version } from "../package.json";
import type { Event } from "../types/event";

const ready: Event<"void"> = {
	name: "ready",
	once: true,
	callback: () => {
		console.log(`Client is ready, running version: ${version}`);
	},
};

export default ready;
