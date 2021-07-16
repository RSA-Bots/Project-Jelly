import type { Event } from "../types/event";

const ready: Event<void> = {
	Name: "ready",
	Config: {
		Enabled: true,
	},

	Execute: () => {
		console.log("Bot is online");
	},
};

export { ready };
