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
				name: "suggestions",
				description: "Change the settings for suggestions.",
				options: [
					{
						type: "SUB_COMMAND",
						name: "upload",
						description: "Set the upload channel for a suggestion.",
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
					{
						type: "SUB_COMMAND",
						name: "popular",
						description: "Set the upload channel for a popular suggestion.",
						options: [
							{
								type: "CHANNEL",
								name: "channel",
								description: "The channel to upload popular suggestions to.",
								channelTypes: ["GUILD_TEXT"],
							},
							{
								type: "NUMBER",
								name: "threshold",
								description: "The amount of upvotes to be considered popular.",
							},
							{
								type: "BOOLEAN",
								name: "poll",
								description: "Create a poll for the uploaded suggestions?",
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
				case "suggestions": {
					switch (interaction.options.getSubcommand(false)) {
						case "upload": {
							const channel = interaction.options.getChannel("channel");
							if (channel) guild.cache.settings.suggestions.upload.default.id = channel.id;

							await updateSettings(interaction.guildId, guild.cache.settings);

							await interaction.editReply({
								content: "Settings for suggestions have been updated.",
							});
							break;
						}
						case "popular": {
							const channel = interaction.options.getChannel("channel");
							if (channel) guild.cache.settings.suggestions.upload.popular.id = channel.id;

							const threshold = interaction.options.getNumber("threshold");
							if (threshold) guild.cache.settings.suggestions.upload.popular.threshold = threshold;

							const poll = interaction.options.getBoolean("poll");
							if (poll) guild.cache.settings.suggestions.upload.popular.poll = poll;

							await updateSettings(interaction.guildId, guild.cache.settings);

							await interaction.editReply({
								content: "Settings for suggestions have been updated.",
							});
							break;
						}
					}
					break;
				}
			}
		},
	})
	.setPermissions([Permissions.FLAGS.MANAGE_GUILD]);
