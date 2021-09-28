import { GuildChannel, Permissions } from "discord.js";
import type { Command } from "../types/command";
import { IGuild } from "../types/guild";

const settings: Command = {
	name: "settings",
	interaction: {
		description: "Change settings for a guild.",
		options: [
			{
				type: "SUB_COMMAND_GROUP",
				name: "tickets",
				description: "Manage settings for ticket uploads and creation.",
				options: [
					{
						type: "SUB_COMMAND",
						name: "upload",
						description: "Change the channel tickets are uploaded to.",
						options: [
							{
								type: "CHANNEL",
								name: "channel",
								description: "Channel to upload tickets to.",
							},
						],
					},
					{
						type: "SUB_COMMAND",
						name: "create",
						description: "Change the channel tickets can be created in.",
						options: [
							{
								type: "CHANNEL",
								name: "channel",
								description: "Channel tickets can be created in.",
							},
						],
					},
				],
			},
		],
		defaultPermission: false,
		enabled: true,
		callback: async interaction => {
			switch (interaction.options.getSubcommandGroup(false)) {
				case "tickets": {
					switch (interaction.options.getSubcommand(false)) {
						case "upload": {
							if (interaction.member && interaction.guild) {
								const channel = interaction.options.getChannel("channel") as GuildChannel;
								const channelId = channel ? channel.id : "";

								await IGuild.updateOne(
									{ id: interaction.guild.id },
									{
										$set: {
											"settings.tickets.uploadChannel": channelId,
										},
									}
								);

								if (channelId) {
									await interaction.reply({
										ephemeral: true,
										content: `Successfully set the upload channel for tickets to <#${channelId}>`,
									});
								} else {
									await interaction.reply({
										ephemeral: true,
										content: "Tickets will now be uploaded to the channel they are created in.",
									});
								}
							}
							break;
						}
						case "create": {
							if (interaction.member && interaction.guild) {
								const channel = interaction.options.getChannel("channel") as GuildChannel;
								const channelId = channel ? channel.id : "";

								await IGuild.updateOne(
									{ id: interaction.guild.id },
									{
										$set: {
											"settings.tickets.createChannel": channelId,
										},
									}
								);

								if (channelId) {
									await interaction.reply({
										ephemeral: true,
										content: `Successfully set the creation channel for tickets to <#${channel.id}>`,
									});
								} else {
									await interaction.reply({
										ephemeral: true,
										content: "Tickets can now be created in any channel messages can be sent.",
									});
								}
							}
							break;
						}
					}
					break;
				}
			}
		},
	},
	permissions: [Permissions.FLAGS.MANAGE_GUILD],
};

export default settings;
