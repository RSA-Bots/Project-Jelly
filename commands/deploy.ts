import type { ApplicationCommandData, Client } from "discord.js";
import { GetCommands } from "../globals";
import type { Command } from "../types/command";

const deploy: Command = {
	Name: "deploy",
	Description: "Deploys interactions",
	Options: [],
	Config: {
		Enabled: true,
		Authority: 0,
		IsSlashCommand: true,
	},

	Execute: async (Bot: Client) => {
		const Commands: Command[] = await GetCommands();
		const Interactions: ApplicationCommandData[] = [];
		for (let Index = 0; Index < Commands.length; Index++) {
			const Command = Commands[Index];
			if (Command.Config.IsSlashCommand) {
				Interactions.push({
					name: Command.Name,
					description: Command.Description,
					options: Command.Options,
				});
			}
		}
		await Bot.guilds.cache.get("826320767007850496")?.commands.set(Interactions);
		return Promise.resolve();
	},
};

export { deploy };
