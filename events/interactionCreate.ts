import type { ButtonInteraction, CommandInteraction, SelectMenuInteraction } from "discord.js";
import { getCommands } from "../globals";
import type { Event } from "../types/event";

const interactionCreate: Event<"Interaction"> = {
	name: "interactionCreate",
	once: false,

	callback: async (interaction: CommandInteraction | ButtonInteraction | SelectMenuInteraction) => {
		if (interaction.isCommand()) {
			const commands = await getCommands();

			const query = commands.find(command => command.name.toLowerCase() == interaction.commandName)?.interaction;

			if (query) {
				query.callback(interaction);
			}
		} else if (interaction.isButton()) {
			const commands = await getCommands();

			commands.forEach(command => {
				const button = command.buttons?.find(button => button.object.customId == interaction.customId);
				if (button) {
					button.callback(interaction);
				}
			});
		} else if (interaction.isSelectMenu()) {
			const commands = await getCommands();

			commands.forEach(command => {
				const menu = command.menus?.find(menu => menu.object.customId == interaction.customId);
				if (menu) {
					menu.callback(interaction);
				}
			});
		}
	},
};

export default interactionCreate;
