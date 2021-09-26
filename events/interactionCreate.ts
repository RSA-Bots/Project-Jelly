import type { Interaction } from "discord.js";
import { getCommands } from "../globals";
import type { Event } from "../types/event";

const interactionCreate: Event<"Interaction"> = {
	name: "interactionCreate",
	once: false,

	callback: async (interaction: Interaction) => {
		if (interaction.isCommand()) {
			const commands = await getCommands();

			const search = commands.find(command => command.name.toLowerCase() == interaction.commandName);
			if (search && search.interaction) {
				search.interaction.callback(interaction);
			}
		} else if (interaction.isButton()) {
			const commands = await getCommands();

			commands.forEach(command => {
				if (command.buttons) {
					const button = command.buttons.find(
						buttonObject => buttonObject.button.customId == interaction.customId
					);
					if (button) {
						button.callback(interaction);
					}
				}
			});
		} else if (interaction.isSelectMenu()) {
			const commands = await getCommands();

			commands.forEach(command => {
				if (command.menus) {
					const menu = command.menus.find(menuObject => menuObject.menu.customId == interaction.customId);
					if (menu) {
						menu.callback(interaction);
					}
				}
			});
		}
	},
};

export default interactionCreate;
