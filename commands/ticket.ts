import {
	ButtonInteraction,
	EmbedField,
	GuildChannelResolvable,
	GuildMember,
	MessageActionRow,
	MessageButton,
	MessageEmbed,
	Permissions,
	TextChannel,
	ThreadChannel,
} from "discord.js";
import type { Document } from "mongoose";
import { getGuild, guildCache } from "../globals";
import type { Command } from "../types/command";
import { guildData, IGuild } from "../types/guild";
import type { Ticket } from "../types/ticket";

const ticket: Command = {
	name: "ticket",
	interaction: {
		description: "Create and manage tickets, and edit settings for them.",
		options: [
			{
				type: "SUB_COMMAND",
				name: "create",
				description: "Create a ticket.",
				options: [
					{
						type: "STRING",
						name: "description",
						description: "A description of the problem.",
						required: true,
					},
					{
						type: "USER",
						name: "user",
						description: "Any user(s) involved in the problem.",
					},
					{
						type: "STRING",
						name: "link",
						description: "Link to the message or a screenshot the ticket is related to.",
					},
				],
			},
			{
				type: "SUB_COMMAND",
				name: "view",
				description: "Repost a ticket to view.",
				options: [
					{
						type: "STRING",
						name: "id",
						description: "The id of the ticket to view.",
						required: true,
					},
				],
			},
		],
		defaultPermission: true,
		enabled: true,
		callback: async interaction => {
			switch (interaction.options.getSubcommand(false)) {
				case "create": {
					const guild = (await getGuild(interaction.guildId as string)) as Document<guildData> & guildData;
					const guildInfo = guildCache.find(guild => guild.id == interaction.guildId) as Document<guildData> &
						guildData;

					if (
						guild.settings.tickets.createChannel == "" ||
						guild.settings.tickets.createChannel == interaction.channelId
					) {
						const newTicket: Ticket = {
							id: guildInfo.tickets.length.toString(),
							messageId: "",
							channelId: "",
							threadId: "",
							status: "open",
							createdBy: {
								id: interaction.user.id,
								time: new Date().toLocaleString(),
							},
							closedBy: {
								id: "",
								time: "",
							},
						};

						const row = new MessageActionRow();
						if (ticket.buttons) {
							ticket.buttons.forEach(data => row.addComponents(data.button));
						}

						const embed = new MessageEmbed()
							.setAuthor(
								interaction.user.username + "#" + interaction.user.discriminator,
								interaction.user.avatarURL() as string
							)
							.setDescription(interaction.options.getString("description") as string)
							.setFooter(`id: ${newTicket.id}`)
							.setTimestamp()
							.setColor((interaction.member as GuildMember).displayColor)
							.setThumbnail("https://i.imgur.com/7wmKEJC.png");

						const user = interaction.options.getUser("user");
						if (user) {
							embed.addField("Accused", `<@${user.id}>`, true);
						}
						const link = interaction.options.getString("link");
						if (
							link &&
							(link.startsWith("https://") || link.startsWith("http://") || link.startsWith("www."))
						) {
							embed.addField("Incident", `[Link/Screenshot](${link})`, true);
						}
						embed.addField("Status", "Open", false);

						guildInfo.tickets.push(newTicket);
						await IGuild.updateOne(
							{ id: interaction.guild?.id },
							{
								$push: { tickets: newTicket },
							}
						);

						const bot = interaction.guild?.me;
						const uploadChannel =
							(await interaction.guild?.channels.fetch(guild.settings.tickets.uploadChannel)) ??
							interaction.channel;

						if (
							uploadChannel &&
							uploadChannel.type == "GUILD_TEXT" &&
							bot &&
							bot.permissionsIn(uploadChannel as GuildChannelResolvable).has("VIEW_CHANNEL") &&
							bot.permissionsIn(uploadChannel as GuildChannelResolvable).has("SEND_MESSAGES")
						) {
							const thread = await uploadChannel.threads.create({
								name: `Ticket ${newTicket.id}`,
								autoArchiveDuration: 1440,
								type: "GUILD_PRIVATE_THREAD",
							});

							await thread.members.add(interaction.user);

							const embedMessage = await thread.send({
								embeds: [embed],
								components: [row],
							});

							await embedMessage.pin();

							const message = await uploadChannel.send({
								content: `Ticket \`\`id: ${newTicket.id}\`\` was created.\nThread: <#${thread.id}>`,
							});

							await IGuild.updateOne(
								{ id: interaction.guild?.id, "tickets.id": newTicket.id },
								{
									$set: {
										"tickets.$.threadId": thread.id,
										"tickets.$.messageId": embedMessage.id,
										"tickets.$.channelId": message.channelId,
									},
								}
							);

							await interaction.reply({
								ephemeral: true,
								content: `Ticket \`\`id: ${newTicket.id}\`\` was created.\nThread: <#${thread.id}>`,
							});
						} else {
							await interaction.reply({
								ephemeral: true,
								content: `Ticket was not posted because the bot does not have the \`\`SEND_MESSAGES\`\` and \`\`VIEW_CHANNEL\`\` permissions in the upload channel. It has still been stored with \`\`id: ${newTicket.id}\`\``,
							});
						}
					} else {
						await interaction.reply({
							ephemeral: true,
							content: `You can only create tickets in <#${guild.settings.tickets.createChannel}>`,
						});
					}
					break;
				}
				case "view": {
					const guild = (await getGuild(interaction.guildId as string)) as Document<guildData> & guildData;
					const cachedTicket = guild.tickets.find(
						ticket => ticket.id == (interaction.options.getString("id") as string)
					);

					if (cachedTicket) {
						await interaction.reply({
							ephemeral: true,
							content: `<#${cachedTicket.threadId}>`,
						});
					}

					break;
				}
			}
		},
	},
	buttons: [
		{
			button: new MessageButton()
				.setCustomId("closeTicket")
				.setLabel("Close")
				.setStyle("DANGER")
				.setDisabled(false),
			callback: async (interaction: ButtonInteraction): Promise<void> => {
				const guild = (await getGuild(interaction.guildId as string)) as Document<guildData> & guildData;
				const cachedTicket = guild.tickets.find(
					ticket => ticket.threadId == (interaction.channelId as string)
				) as Ticket;

				const channel = (await interaction.guild?.channels.fetch(cachedTicket.channelId)) as TextChannel;
				const thread = (await channel.threads.fetch(cachedTicket.threadId)) as ThreadChannel;

				const embedMessage = await thread.messages.fetch(cachedTicket.messageId);
				const embed = embedMessage.embeds[0];
				const statusField = embed.fields.find(field => field.name == "Status") as EmbedField;
				statusField.value = `Closed by <@${interaction.user.id}>`;

				await embedMessage.edit({
					embeds: [embed],
				});

				await interaction.deferUpdate();

				await thread.setArchived(true);

				await IGuild.updateOne(
					{ id: interaction.guild?.id, "tickets.id": cachedTicket.id },
					{
						$set: {
							"tickets.$.closedBy": {
								id: interaction.user.id,
								time: new Date().toLocaleString(),
							},
							"tickets.$.status": "closed",
						},
					}
				);
			},
			permissions: [Permissions.FLAGS.MANAGE_MESSAGES],
		},
	],
};

export default ticket;
