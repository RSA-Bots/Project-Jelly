import {
	ButtonInteraction,
	EmbedField,
	GuildChannelResolvable,
	GuildMember,
	Message,
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
					const guildInfo = guildCache.find(
						guild => guild.id == interaction.guild?.id
					) as Document<guildData> & guildData;

					if (
						guild.settings.tickets.createChannel == "" ||
						guild.settings.tickets.createChannel == interaction.channelId
					) {
						const newTicket: Ticket = {
							id: guildInfo.tickets.length.toString(),
							messageId: "",
							channelId: "",
							threadId: "",
							status: "pending",
							createdBy: {
								id: interaction.user.id,
								time: new Date().toLocaleString(),
							},
							openedBy: {
								id: "",
								time: "",
							},
							closedBy: {
								id: "",
								time: "",
							},
						};

						guildInfo.tickets.push(newTicket);

						await IGuild.updateOne(
							{ id: interaction.guild?.id },
							{
								$push: { tickets: newTicket },
							}
						);

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

						embed.addField("Status", "Pending", false);

						const uploadChannel = guild.settings.tickets.uploadChannel;
						const bot = interaction.guild?.me;

						if (
							uploadChannel != "" &&
							bot &&
							bot.permissionsIn(interaction.channel as GuildChannelResolvable).has("VIEW_CHANNEL") &&
							bot.permissionsIn(interaction.channel as GuildChannelResolvable).has("SEND_MESSAGES")
						) {
							const message = await (
								(await interaction.guild?.channels.fetch(uploadChannel)) as TextChannel
							).send({
								embeds: [embed],
								components: [row],
							});

							await IGuild.updateOne(
								{ id: interaction.guild?.id, "tickets.id": newTicket.id },
								{
									$set: {
										"tickets.$.messageId": message.id,
										"tickets.$.channelId": message.channelId,
									},
								}
							);

							await interaction.reply({
								ephemeral: true,
								content: `Your ticket has successfully been created. For reference, your ticket id is: \`\`${newTicket.id}\`\``,
							});
						} else if (uploadChannel == "") {
							await interaction.reply({
								embeds: [embed],
								components: [row],
							});

							const reply = (await interaction.fetchReply()) as Message;

							if (reply) {
								await IGuild.updateOne(
									{ id: interaction.guild?.id, "tickets.id": newTicket.id },
									{
										$set: {
											"tickets.$.messageId": reply.id,
											"tickets.$.channelId": reply.channelId,
										},
									}
								);

								await interaction.followUp({
									ephemeral: true,
									content: `Your ticket has successfully been created. For reference, your ticket id is: \`\`${newTicket.id}\`\``,
								});
							}
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
					if (
						interaction.member &&
						interaction.guild &&
						(interaction.member.permissions as Permissions).has(Permissions.FLAGS.MANAGE_MESSAGES)
					) {
						const guild = (await getGuild(interaction.guildId as string)) as Document<guildData> &
							guildData;
						const ticketId = interaction.options.getString("id");
						const cachedTicket = guild.tickets.find(ticket => ticket.id == ticketId);

						if (cachedTicket) {
							const channel = (await interaction.guild.channels.fetch(
								cachedTicket.channelId
							)) as TextChannel;
							const message = await channel.messages.fetch(cachedTicket.messageId);
							const uploadChannel = guild.settings.tickets.uploadChannel;

							const bot = interaction.guild.me;

							const repost = {
								valid: false,
								messageId: cachedTicket.messageId,
								channelId: cachedTicket.channelId,
							};

							if (
								uploadChannel != "" &&
								bot &&
								bot.permissionsIn(interaction.channel as GuildChannelResolvable).has("VIEW_CHANNEL") &&
								bot.permissionsIn(interaction.channel as GuildChannelResolvable).has("SEND_MESSAGES")
							) {
								const newMessage = await (
									(await interaction.guild.channels.fetch(uploadChannel)) as TextChannel
								).send({
									embeds: message.embeds,
									components: message.components,
								});

								repost.messageId = newMessage.id;
								repost.channelId = newMessage.channelId;
								repost.valid = true;

								await interaction.reply({
									ephemeral: true,
									content: `Ticket \`\`id: ${ticketId as string}\`\` has been reposted.`,
								});
							} else if (uploadChannel == "") {
								await interaction.reply({
									embeds: message.embeds,
									components: message.components,
								});

								const reply = (await interaction.fetchReply()) as Message;

								repost.messageId = reply.id;
								repost.channelId = reply.channelId;
								repost.valid = true;
							} else {
								await interaction.reply({
									ephemeral: true,
									content: `Ticket was not reposted because the bot does not have the \`\`SEND_MESSAGES\`\` and \`\`VIEW_CHANNEL\`\` permissions in the upload channel.`,
								});
							}

							if (repost.valid) {
								await IGuild.updateOne(
									{ id: interaction.guild.id, "tickets.id": ticketId },
									{
										$set: {
											"tickets.$.messageId": repost.messageId,
											"tickets.$.channelId": repost.channelId,
										},
									}
								);
								await message.delete();
							}
						} else {
							await interaction.reply({
								ephemeral: true,
								content: `No ticket of \`\`id: ${ticketId as string}\`\` exists`,
							});
						}
					} else {
						await interaction.reply({
							ephemeral: true,
							content: `You need the \`\`MANAGE_MESSAGES\`\` permission to use this command.`,
						});
					}

					break;
				}
			}
		},
	},
	buttons: [
		{
			button: new MessageButton().setCustomId("openTicket").setLabel("Open").setStyle("SUCCESS"),
			callback: async (interaction: ButtonInteraction): Promise<void> => {
				if (interaction.member && interaction.guild) {
					const embed = interaction.message.embeds[0] as MessageEmbed;
					(
						embed.fields.find(field => field.name == "Status") as EmbedField
					).value = `Opened by <@${interaction.user.id}>`;

					const rows = interaction.message.components as MessageActionRow[];
					for (const row of rows) {
						row.components.forEach(component => {
							if (component.customId == "openTicket") {
								component.setDisabled(true);
							}
							if (component.customId == "closeTicket") {
								component.setDisabled(false);
							}
						});
					}

					await interaction.update({
						embeds: [embed],
						components: rows,
					});

					const ticketId = embed.footer?.text?.split(" ")[1];

					const guild = (await getGuild(interaction.guildId as string)) as Document<guildData> & guildData;
					const cachedTicket = guild.tickets.find(ticket => ticket.id == (ticketId as string)) as Ticket;

					if (cachedTicket.threadId != "") {
						const channel = (await interaction.guild.channels.fetch(cachedTicket.channelId)) as TextChannel;
						const thread = await channel.threads.fetch(cachedTicket.threadId);

						if (thread && thread.archived) {
							await thread.setArchived(false);
							await thread.setAutoArchiveDuration(1440);
						} else if (thread) {
							await thread.setAutoArchiveDuration(1440);
						}
					} else {
						const thread = await (interaction.channel as TextChannel).threads.create({
							startMessage: interaction.message as Message,
							name: `Ticket ${ticketId as string}`,
							autoArchiveDuration: 1440,
							type: "GUILD_PRIVATE_THREAD",
						});

						await thread.members.add(interaction.user);
						await thread.members.add(cachedTicket.createdBy.id);

						cachedTicket.threadId = thread.id;
					}

					await IGuild.updateOne(
						{ id: interaction.guild.id, "tickets.id": ticketId },
						{
							$set: {
								"tickets.$.openedBy": {
									id: interaction.user.id,
									time: new Date().toLocaleString(),
								},
								"tickets.$.status": "open",
								"tickets.$.threadId": cachedTicket.threadId,
							},
						}
					);
				}
			},
			permissions: [Permissions.FLAGS.MANAGE_MESSAGES],
		},
		{
			button: new MessageButton()
				.setCustomId("closeTicket")
				.setLabel("Close")
				.setStyle("DANGER")
				.setDisabled(true),
			callback: async (interaction: ButtonInteraction): Promise<void> => {
				if (interaction.member && interaction.guild) {
					const embed = interaction.message.embeds[0] as MessageEmbed;
					(
						embed.fields.find(field => field.name == "Status") as EmbedField
					).value = `Closed by <@${interaction.user.id}>`;

					const rows = interaction.message.components as MessageActionRow[];
					for (const row of rows) {
						row.components.forEach(component => {
							if (component.customId == "closeTicket") {
								component.setDisabled(true);
							}
							if (component.customId == "openTicket") {
								component.setDisabled(false);
							}
						});
					}

					const ticketId = embed.footer?.text?.split(" ")[1];

					const guild = (await getGuild(interaction.guildId as string)) as Document<guildData> & guildData;
					const cachedTicket = guild.tickets.find(ticket => ticket.id == (ticketId as string)) as Ticket;

					const channel = (await interaction.guild.channels.fetch(cachedTicket.channelId)) as TextChannel;
					const thread = (await channel.threads.fetch(cachedTicket.threadId)) as ThreadChannel;

					await thread.setArchived(true);

					await interaction.update({
						embeds: [embed],
						components: rows,
					});

					await IGuild.updateOne(
						{ id: interaction.guild.id, "tickets.id": ticketId },
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
				}
			},
			permissions: [Permissions.FLAGS.MANAGE_MESSAGES],
		},
	],
};

export default ticket;
