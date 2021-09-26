import {
	ButtonInteraction,
	EmbedField,
	GuildMember,
	Message,
	MessageActionRow,
	MessageButton,
	MessageEmbed,
	Permissions,
	TextChannel,
} from "discord.js";
import { getCollection, getGuild } from "../globals";
import type { Command } from "../types/command";
import type { Guild } from "../types/guild";
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
						name: "title",
						description: "Summary of the problem.",
						required: true,
					},
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
					const guild = (await getGuild(interaction.guildId as string)) as Guild;
					if (
						!guild.settings.tickets.createChannel ||
						(guild.settings.tickets.createChannel &&
							guild.settings.tickets.createChannel == interaction.channelId)
					) {
						const tickets = guild.tickets;

						const date = new Date();

						const newTicket: Ticket = {
							id: tickets.length,
							status: "unresolved",
							createdBy: {
								id: interaction.user.id,
								time: date.toLocaleString(),
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
							.addField(
								interaction.options.getString("title") as string,
								interaction.options.getString("description") as string,
								false
							)
							.setFooter(`id: ${newTicket.id}`)
							.setTimestamp()
							.setColor((interaction.member as GuildMember).displayColor)
							.setThumbnail("https://i.imgur.com/7wmKEJC.png");

						const user = interaction.options.getUser("user");
						if (user) {
							embed.addField("Accused", user.username + "#" + user.discriminator, true);
						}
						const link = interaction.options.getString("link");
						if (link) {
							embed.addField("Incident", link, true);
						}

						embed.addField("Status", "Unresolved", false);

						const uploadChannel = guild.settings.tickets.uploadChannel;
						if (uploadChannel && interaction.guild) {
							const message = await (
								(await interaction.guild.channels.fetch(uploadChannel)) as TextChannel
							).send({
								embeds: [embed],
								components: [row],
							});

							newTicket.messageId = message.id;
							newTicket.channelId = message.channelId;
						} else {
							await interaction.reply({
								embeds: [embed],
								components: [row],
							});

							const reply = (await interaction.fetchReply()) as Message;

							newTicket.messageId = reply.id;
							newTicket.channelId = reply.channelId;
						}

						await interaction.followUp({
							ephemeral: true,
							content: `Your ticket has successfully been created. For reference, your ticket id is: \`\`${newTicket.id}\`\``,
						});

						const guilds = getCollection("guilds");
						if (guilds) {
							await guilds.updateOne(
								{ id: interaction.guildId },
								{
									$push: {
										tickets: newTicket,
									},
								}
							);
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
						(interaction.member.permissions as Permissions).has(Permissions.FLAGS.MANAGE_MESSAGES)
					) {
						const guild = (await getGuild(interaction.guildId as string)) as Guild;
						const ticketId = interaction.options.getString("id");
						const query = guild.tickets.find(ticket => ticket.id == ticketId);

						if (interaction.guild && query && query.messageId && query.channelId) {
							const channel = (await interaction.guild.channels.fetch(query.channelId)) as TextChannel;
							const message = await channel.messages.fetch(query.messageId);
							const uploadChannel = guild.settings.tickets.uploadChannel;

							if (uploadChannel) {
								const newMessage = await (
									(await interaction.guild.channels.fetch(uploadChannel)) as TextChannel
								).send({
									embeds: message.embeds,
									components: message.components,
								});

								query.messageId = newMessage.id;
								query.channelId = newMessage.channelId;
							} else {
								await interaction.reply({
									embeds: message.embeds,
									components: message.components,
								});

								const reply = (await interaction.fetchReply()) as Message;

								query.messageId = reply.id;
								query.channelId = reply.channelId;
							}

							const guilds = getCollection("guilds");

							if (guilds && message.embeds[0].footer && message.embeds[0].footer.text) {
								await guilds.updateOne(
									{
										id: interaction.guildId,
										"tickets.id": Number(message.embeds[0].footer.text.split(" ")[1]),
									},
									{
										$set: {
											"tickets.$.messageId": query.messageId,
											"tickets.$.channelId": query.channelId,
										},
									}
								);
							}

							await message.delete();
						} else if (!query) {
							await interaction.reply({
								ephemeral: true,
								content: `No message with id: \`\`${ticketId as string}\`\` exists`,
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
			button: new MessageButton().setCustomId("acceptTicket").setLabel("Accept").setStyle("SUCCESS"),
			callback: async (interaction: ButtonInteraction): Promise<void> => {
				if (
					interaction.member &&
					(interaction.member.permissions as Permissions).has(Permissions.FLAGS.MANAGE_MESSAGES)
				) {
					const embed = interaction.message.embeds[0] as MessageEmbed;
					(embed.fields.find(field => field.name == "Status") as EmbedField).value = `Accepted by ${
						interaction.user.username + "#" + interaction.user.discriminator
					}`;

					const rows = interaction.message.components as MessageActionRow[];
					for (const row of rows) {
						row.components.find(component => component.customId == "closeTicket")?.setDisabled(false);
					}

					await interaction.update({
						embeds: [embed],
						components: rows,
					});

					const guilds = getCollection("guilds");
					const date = new Date();

					if (guilds && embed.footer && embed.footer.text) {
						await guilds.updateOne(
							{ id: interaction.guildId, "tickets.id": Number(embed.footer.text.split(" ")[1]) },
							{
								$set: {
									"tickets.$.status": "accepted",
									"tickets.$.acceptedBy": {
										id: interaction.user.id,
										time: date.toLocaleString(),
									},
								},
							}
						);
					}
				} else {
					await interaction.reply({
						ephemeral: true,
						content: `You need the \`\`MANAGE_MESSAGES\`\` permission to use this button.`,
					});
				}
			},
		},
		{
			button: new MessageButton()
				.setCustomId("closeTicket")
				.setLabel("Close")
				.setStyle("PRIMARY")
				.setDisabled(true),
			callback: async (interaction: ButtonInteraction): Promise<void> => {
				if (
					interaction.member &&
					(interaction.member.permissions as Permissions).has(Permissions.FLAGS.MANAGE_MESSAGES)
				) {
					const embed = interaction.message.embeds[0] as MessageEmbed;
					(embed.fields.find(field => field.name == "Status") as EmbedField).value = `Closed by ${
						interaction.user.username + "#" + interaction.user.discriminator
					}`;

					const rows = interaction.message.components as MessageActionRow[];
					for (const row of rows) {
						row.components.forEach(component => {
							if (component.customId == "acceptTicket" || component.customId == "closeTicket") {
								component.setDisabled(true);
							}
						});
					}

					await interaction.update({
						embeds: [embed],
						components: rows,
					});

					const guilds = getCollection("guilds");
					const date = new Date();

					if (guilds && embed.footer && embed.footer.text) {
						await guilds.updateOne(
							{ id: interaction.guildId, "tickets.id": Number(embed.footer.text.split(" ")[1]) },
							{
								$set: {
									"tickets.$.status": "closed",
									"tickets.$.closedBy": {
										id: interaction.user.id,
										time: date.toLocaleString(),
									},
								},
							}
						);
					}
				} else {
					await interaction.reply({
						ephemeral: true,
						content: `You need the \`\`MANAGE_MESSAGES\`\` permission to use this button.`,
					});
				}
			},
		},
	],
};

export default ticket;
