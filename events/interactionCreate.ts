import type { Interaction } from "discord.js";
import { getCommands } from "../globals";
import type { Event } from "../types/event";

const interactionCreate: Event<"Interaction"> = {
	name: "interactionCreate",
	once: false,

	callback: async (interaction: Interaction) => {
		if (interaction && interaction.isCommand()) {
			if (interaction.isCommand()) {
				const commands = await getCommands();

				const query = commands.filter(command => {
					return command.name.toLowerCase() == interaction.commandName && command.interaction;
				});

				if (query.length > 0) {
					const request = query[0];

					if (request.interaction) {
						request.interaction.callback(interaction);
					}
				}
			}
		}
	},
};

export default interactionCreate;
