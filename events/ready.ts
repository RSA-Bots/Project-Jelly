import type { Event } from "../types/event";

const ready: Event<void> = {
	name: "ready",
	config: {
		enabled: true,
	},

	execute: () => {
		console.log("Bot is online");
	},
};

export { ready };
