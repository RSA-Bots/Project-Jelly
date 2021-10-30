import type { Interaction } from "discord.js";
import { getCommands } from "../globals";
import type { Event } from "../types/event";

const interactionCreate: Event<Interaction> = {
	name: "interactionCreate",
	once: false,

	callback: async (interaction: Interaction) => {
		if (
			!interaction.guild ||
			!interaction.member ||
			typeof interaction.member.permissions == "string"
		)
			return;

		const bot = interaction.guild.me;
		if (
			!interaction.channel ||
			!(
				interaction.channel.type == "GUILD_TEXT" ||
				interaction.channel.type == "GUILD_PRIVATE_THREAD" ||
				interaction.channel.type == "GUILD_PUBLIC_THREAD" ||
				interaction.channel.type == "GUILD_NEWS_THREAD"
			) ||
			!bot ||
			!bot.permissionsIn(interaction.channel).has("VIEW_CHANNEL") ||
			!bot.permissionsIn(interaction.channel).has("SEND_MESSAGES")
		)
			return;

		if (interaction.isCommand()) {
			const commands = await getCommands();

			const command = commands.find(command => command.name.toLowerCase() == interaction.commandName);
			if (command && command.interaction) {
				if (command.permissions && interaction.member.permissions.has(command.permissions)) {
					command.interaction.callback(interaction);
				} else if (!command.permissions) {
					command.interaction.callback(interaction);
				} else if (command.permissions && !interaction.member.permissions.has(command.permissions)) {
					await interaction.reply({
						ephemeral: true,
						content: "You have insufficient permissions to use this command.",
					});
				}
			}
		} else if (interaction.isButton()) {
			const commands = await getCommands();

			for (const command of commands) {
				if (command.buttons) {
					const button = command.buttons.find(
						buttonObject => buttonObject.button.customId == interaction.customId
					);
					if (button) {
						if (button.permissions && interaction.member.permissions.has(button.permissions)) {
							button.callback(interaction);
						} else if (!button.permissions) {
							button.callback(interaction);
						} else if (button.permissions && !interaction.member.permissions.has(button.permissions)) {
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
						if (menu.permissions && interaction.member.permissions.has(menu.permissions)) {
							menu.callback(interaction);
						} else if (!menu.permissions) {
							menu.callback(interaction);
						} else if (menu.permissions && !interaction.member.permissions.has(menu.permissions)) {
							await interaction.reply({
								ephemeral: true,
								content: "You have insufficient permissions to use this menu.",
							});
						}
					}
				}
			}
		}
	},
};

export default interactionCreate;
