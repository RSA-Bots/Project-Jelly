import type { Interaction } from "discord.js";
import { commands } from "../types/command";
import { Event } from "../types/event";
import { getUser } from "../types/user";

new Event<Interaction>("interactionCreate", false, async (interaction: Interaction) => {
	if (!interaction.guild || !interaction.member || typeof interaction.member.permissions == "string") return;

	const bot = interaction.guild.me;
	if (
		!interaction.channel ||
		!(
			interaction.channel.type == "GUILD_TEXT" ||
			interaction.channel.type == "GUILD_PRIVATE_THREAD" ||
			interaction.channel.type == "GUILD_PUBLIC_THREAD" ||
			interaction.channel.type == "GUILD_NEWS" ||
			interaction.channel.type == "GUILD_NEWS_THREAD"
		) ||
		!bot ||
		!bot.permissionsIn(interaction.channel).has("VIEW_CHANNEL") ||
		!bot.permissionsIn(interaction.channel).has("SEND_MESSAGES")
	)
		return;

	if (interaction.isCommand()) {
		const user = await getUser(interaction.user.id);
		if (!user) return;

		await user.updateCommandCount(user.commandCount + 1);

		const command = commands.find(command => command.name == interaction.commandName);
		if (command && command.events.slashCommand) {
			if (command.permissions && interaction.member.permissions.has(command.permissions)) {
				command.events.slashCommand.callback(interaction);
			} else if (!command.permissions) {
				command.events.slashCommand.callback(interaction);
			} else if (command.permissions && !interaction.member.permissions.has(command.permissions)) {
				await interaction.reply({
					ephemeral: true,
					content: "You have insufficient permissions to use this command.",
				});
			}
		}
	} else if (interaction.isButton()) {
		await interaction.deferUpdate();
		for (const command of commands) {
			if (command.buttons) {
				const button = command.buttons.find(button => button.object.customId == interaction.customId);
				if (button) {
					if (button.permissions && interaction.member.permissions.has(button.permissions)) {
						button.callback(interaction);
					} else if (!button.permissions) {
						button.callback(interaction);
					}
				}
			}
		}
	} else if (interaction.isSelectMenu()) {
		await interaction.deferUpdate();
		for (const command of commands) {
			if (command.menus) {
				const menu = command.menus.find(menu => menu.object.customId == interaction.customId);
				if (menu) {
					if (menu.permissions && interaction.member.permissions.has(menu.permissions)) {
						menu.callback(interaction);
					} else if (!menu.permissions) {
						menu.callback(interaction);
					}
				}
			}
		}
	}
});
