import { Interaction, NewsChannel, TextChannel, ThreadChannel } from "discord.js";
import { commands } from "../types/command";
import { Event } from "../types/event";

new Event<Interaction>("interactionCreate", false, async (interaction: Interaction) => {
	if (
		!interaction.guild ||
		!interaction.guild.me ||
		!interaction.memberPermissions ||
		!interaction.channel ||
		!(
			interaction.channel instanceof (TextChannel || NewsChannel || ThreadChannel) &&
			interaction.channel.permissionsFor(interaction.guild.me).has(["VIEW_CHANNEL", "SEND_MESSAGES"])
		)
	)
		return;

	if (interaction.isCommand()) {
		const command = commands.find(command => command.name == interaction.commandName);
		if (command && command.events.slashCommand) {
			if (command.permissions && interaction.memberPermissions.has(command.permissions)) {
				command.events.slashCommand.callback(interaction);
			} else if (!command.permissions) {
				command.events.slashCommand.callback(interaction);
			} else if (command.permissions && !interaction.memberPermissions.has(command.permissions)) {
				await interaction.reply({
					ephemeral: true,
					content: `"You have insufficient permissions to use this command."`,
				});
			}
		}
	} else if (interaction.isButton()) {
		await interaction.deferUpdate();
		for (const command of commands) {
			if (command.buttons) {
				const button = command.buttons.find(button => button.object.customId == interaction.customId);
				if (button) {
					if (button.permissions && interaction.memberPermissions.has(button.permissions)) {
						button.callback(interaction);
					} else if (!button.permissions) {
						button.callback(interaction);
					} else {
						await interaction.reply({
							ephemeral: true,
							content: `"You have insufficient permissions to use this button."`,
						});
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
					if (menu.permissions && interaction.memberPermissions.has(menu.permissions)) {
						menu.callback(interaction);
					} else if (!menu.permissions) {
						menu.callback(interaction);
					}
				} else {
					await interaction.reply({
						ephemeral: true,
						content: `"You have insufficient permissions to use this menu."`,
					});
				}
			}
		}
	}
});
