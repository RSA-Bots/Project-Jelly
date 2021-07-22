import type { Client, Interaction } from "discord.js";
import type { Collection } from "mongodb";
import { GetCommands } from "../globals";
import type { Command } from "../types/command";
import type { Event } from "../types/event";

const interactionCreate: Event<Interaction> = {
	Name: "interactionCreate",
	Config: {
		Enabled: true,
	},

	Execute: async (Bot: Client, UserData: Collection, Interaction?: Interaction) => {
		if (Interaction) {
			if (Interaction.isCommand()) {
				const Commands: Command[] = await GetCommands();

				const CommandRequest = Commands.filter(CommandObject => {
					return CommandObject.Name.toLowerCase() == Interaction.commandName;
				});

				if (CommandRequest.length > 0) {
					const Command: Command = CommandRequest[0];
					Command.Execute(Bot, UserData, Interaction);
				}
			}
		}
	},
};

export { interactionCreate };
