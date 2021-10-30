import { Permissions } from "discord.js";
import { getGuild } from "../globals";
import type { Command } from "../types/command";

const settings: Command = {
	name: "settings",
	interaction: {
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
								required: true,
							},
						],
					},
					{
						type: "SUB_COMMAND",
						name: "polls",
						description: "Change the upload channel of polls.",
						options: [
							{
								type: "CHANNEL",
								name: "channel",
								description: "The channel to upload polls to.",
								required: true,
							},
						],
					},
				],
			},
		],
		defaultPermission: true,
		enabled: true,
		callback: async interaction => {
			if (!interaction.guildId) return;

			const guild = await getGuild(interaction.guildId);

			if (guild) {
				switch (interaction.options.getSubcommandGroup(false)) {
					case "upload": {
						switch (interaction.options.getSubcommand(false)) {
							case "suggestions": {
								const channel = interaction.options.getChannel("channel");
								if (channel && (channel.type == "GUILD_TEXT" || channel.type == "GUILD_NEWS_THREAD")) {
									guild.settings.suggestions.upload = channel.id;

									await guild.updateSettings(guild.settings);

									await interaction.reply({
										ephemeral: true,
										content: `Upload channel for suggestions has been set to <#${channel.id}>.`,
									});
								}
								break;
							}
							case "polls": {
								const channel = interaction.options.getChannel("channel");
								if (channel && (channel.type == "GUILD_TEXT" || channel.type == "GUILD_NEWS_THREAD")) {
									guild.settings.polls.upload = channel.id;

									await guild.updateSettings(guild.settings);

									await interaction.reply({
										ephemeral: true,
										content: `Upload channel for polls has been set to <#${channel.id}>.`,
									});
								}
								break;
							}
						}
						break;
					}
				}
			}
		},
	},
	permissions: [Permissions.FLAGS.MANAGE_GUILD],
};

export default settings;
