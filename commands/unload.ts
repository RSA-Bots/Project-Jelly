import type { Client } from "discord.js";
import type { Command } from "../types/command";

const unload: Command = {
	Name: "unload",
	Description: "Resets all interactions",
	Options: [],
	Config: {
		Enabled: true,
		Authority: 0,
		IsSlashCommand: true,
	},

	Execute: async (Bot: Client) => {
		await Bot.application?.commands.set([]);
		await Bot.guilds.cache.get("826320767007850496")?.commands.set([]);
	},
};

export { unload };
