import { Permissions } from "discord.js";
import { Command } from "../types/command";
import { getGuild, updateSettings } from "../types/guild";

new Command("settings")
	.registerCommand({
		type: "slashCommand",
		description: "Change settings for a guild.",
		options: [
			{
				type: "SUB_COMMAND_GROUP",
				name: "upload",
				description: "Change the upload channel for a command.",
				options: [
					{
						type: "SUB_COMMAND",
						name: "suggestions",
						description: "Change the upload channel of suggestions.",
						options: [
							{
								type: "CHANNEL",
								name: "channel",
								description: "The channel to upload suggestions to.",
								channelTypes: ["GUILD_TEXT"],
								required: true,
							},
						],
					},
				],
			},
		],
		defaultPermission: true,
		callback: async interaction => {
			await interaction.deferReply({ ephemeral: true });

			const guild = await getGuild(interaction.guildId);

			switch (interaction.options.getSubcommandGroup(false)) {
				case "upload": {
					switch (interaction.options.getSubcommand(false)) {
						case "suggestions": {
							const channel = interaction.options.getChannel("channel");
							if (channel && (channel.type == "GUILD_TEXT" || channel.type == "GUILD_NEWS")) {
								guild.cache.settings.suggestions.upload = channel.id;
								await updateSettings(interaction.guildId, guild.cache.settings);

								await interaction.editReply({
									content: `Upload channel for suggestions has been set to <#${channel.id}>.`,
								});
							}
							break;
						}
					}
					break;
				}
			}
		},
	})
	.setPermissions([Permissions.FLAGS.MANAGE_GUILD]);
