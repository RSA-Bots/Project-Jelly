import type { GuildChannelResolvable, GuildMember, Interaction } from "discord.js";
import { getCommands } from "../globals";
import type { Event } from "../types/event";

const interactionCreate: Event<"Interaction"> = {
	name: "interactionCreate",
	once: false,

	callback: async (interaction: Interaction) => {
		const bot = interaction.guild?.me;
		const member = interaction.member as GuildMember;
		if (
			bot &&
			bot.permissionsIn(interaction.channel as GuildChannelResolvable).has("VIEW_CHANNEL") &&
			bot.permissionsIn(interaction.channel as GuildChannelResolvable).has("SEND_MESSAGES")
		) {
			if (interaction.isCommand()) {
				const commands = await getCommands();

				const search = commands.find(command => command.name.toLowerCase() == interaction.commandName);
				if (search && search.interaction) {
					search.interaction.callback(interaction);
				}
			} else if (interaction.isButton()) {
				const commands = await getCommands();

				for (const command of commands) {
					if (command.buttons) {
						const button = command.buttons.find(
							buttonObject => buttonObject.button.customId == interaction.customId
						);
						if (button) {
							if (button.permissions && member.permissions.has(button.permissions)) {
								button.callback(interaction);
							} else if (!button.permissions) {
								button.callback(interaction);
							} else if (button.permissions && !member.permissions.has(button.permissions)) {
								await interaction.reply({
									ephemeral: true,
									content: "You have insufficient permissions to use this button.",
								});
							}
						}
					}
				}
			} else if (interaction.isSelectMenu()) {
				const commands = await getCommands();

				for (const command of commands) {
					if (command.menus) {
						const menu = command.menus.find(menuObject => menuObject.menu.customId == interaction.customId);
						if (menu) {
							if (menu.permissions && member.permissions.has(menu.permissions)) {
								menu.callback(interaction);
							} else if (!menu.permissions) {
								menu.callback(interaction);
							} else if (menu.permissions && !member.permissions.has(menu.permissions)) {
								await interaction.reply({
									ephemeral: true,
									content: "You have insufficient permissions to use this menu.",
								});
							}
						}
					}
				}
			}
		}
	},
};

export default interactionCreate;
