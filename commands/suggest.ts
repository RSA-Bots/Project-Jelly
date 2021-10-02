import { ButtonInteraction, MessageActionRow, MessageButton, MessageEmbed, Permissions } from "discord.js";
import { getGuild, guildCache } from "../globals";
import type { Command } from "../types/command";
import type { Suggestion } from "../types/suggestion";

const suggest: Command = {
	name: "suggest",
	interaction: {
		description: "Create a suggestion.",
		options: [
			{
				type: "STRING",
				name: "description",
				description: "A description of the suggestion.",
				required: true,
			},
			{
				type: "STRING",
				name: "link",
				description: "Additional context in the form of a link or screenshot.",
			},
		],
		defaultPermission: true,
		enabled: true,
		callback: async interaction => {
			if (
				!interaction.guildId ||
				!interaction.guild ||
				!interaction.member ||
				!("displayColor" in interaction.member) ||
				!suggest.buttons
			)
				return;

			const guild = await getGuild(interaction.guildId);
			if (!guild) return;

			const guildInfo = guildCache.find(guild => guild.id == interaction.guildId);
			if (!guildInfo) return;

			const bot = interaction.guild.me;
			const uploadChannel =
				(await interaction.guild.channels.fetch(guild.settings.suggestions.upload)) ?? interaction.channel;

			if (
				!uploadChannel ||
				uploadChannel.type != "GUILD_TEXT" ||
				!bot ||
				!bot.permissionsIn(uploadChannel).has("VIEW_CHANNEL") ||
				!bot.permissionsIn(uploadChannel).has("SEND_MESSAGES")
			)
				return;

			const newSuggestion: Suggestion = {
				id: guildInfo.suggestions.length.toString(),
				messageId: "",
				channelId: "",
				threadId: "",
				status: "open",
				author: {
					id: interaction.user.id,
					time: new Date().toLocaleString(),
				},
			};
			await guild.uploadSuggestion(newSuggestion);

			const description = interaction.options.getString("description");
			const avatarURL = interaction.user.avatarURL();
			if (!description || !avatarURL) return;

			const row = new MessageActionRow();
			suggest.buttons.forEach(data => {
				row.addComponents(data.button);
			});

			const embed = new MessageEmbed()
				.setAuthor(interaction.user.username + "#" + interaction.user.discriminator, avatarURL)
				.setDescription(description)
				.addField("Status", "Open", true)
				.setFooter(`id: ${newSuggestion.id}`)
				.setTimestamp()
				.setColor(interaction.member.displayColor)
				.setThumbnail("https://i.imgur.com/OMEaEYY.png");

			const link = interaction.options.getString("link");
			if (link && (link.startsWith("https://") || link.startsWith("http://") || link.startsWith("www."))) {
				embed.addField("Additional Context", link, true);
			}

			const message = await uploadChannel.send({
				embeds: [embed],
				components: [row],
			});
			await message.react("👍"), await message.react("👎");

			const thread = await uploadChannel.threads.create({
				startMessage: message,
				name: `Suggestion ${newSuggestion.id}`,
				autoArchiveDuration: 1440,
				type: "GUILD_PUBLIC_THREAD",
			});

			(newSuggestion.threadId = thread.id),
				(newSuggestion.messageId = message.id),
				(newSuggestion.channelId = message.channelId);

			await guild.updateSuggestion(newSuggestion);

			await interaction.reply({
				ephemeral: true,
				content: `Suggestion has been created, discussion can be found at <#${thread.id}>`,
			});
		},
	},
	buttons: [
		{
			button: new MessageButton()
				.setCustomId("approveSuggestion")
				.setLabel("Approve")
				.setStyle("SUCCESS")
				.setDisabled(false),
			callback: async (interaction: ButtonInteraction): Promise<void> => {
				if (!interaction.guildId || !interaction.guild) return;

				const guild = await getGuild(interaction.guildId);
				if (!guild) return;

				const cachedSuggestion = guild.suggestions.find(
					suggestion => suggestion.messageId == interaction.message.id
				);
				if (!cachedSuggestion) return;

				const channel = await interaction.guild.channels.fetch(cachedSuggestion.channelId);
				if (!channel || channel.type != "GUILD_TEXT") return;

				const thread = await channel.threads.fetch(cachedSuggestion.threadId);
				if (!thread) return;

				await interaction.deferUpdate();

				const message = await channel.messages.fetch(cachedSuggestion.messageId);
				const embed = message.embeds[0];
				const statusField = embed.fields.find(field => field.name == "Status");
				if (!statusField) return;

				statusField.value = `Approved by <@${interaction.user.id}>`;

				const row = new MessageActionRow();
				if (suggest.buttons) {
					for (const button of suggest.buttons.map(data => data.button)) {
						if (button.customId == "approveSuggestion") {
							button.setDisabled(true);
						} else {
							button.setDisabled(false);
						}
						row.addComponents(button);
					}
				}

				await message.edit({
					embeds: [embed],
					components: [row],
				});

				cachedSuggestion.status = "approved";
				await guild.updateSuggestion(cachedSuggestion);
			},
			permissions: [Permissions.FLAGS.MANAGE_MESSAGES],
		},
		{
			button: new MessageButton()
				.setCustomId("denySuggestion")
				.setLabel("Deny")
				.setStyle("DANGER")
				.setDisabled(false),
			callback: async (interaction: ButtonInteraction): Promise<void> => {
				if (!interaction.guildId || !interaction.guild) return;

				const guild = await getGuild(interaction.guildId);
				if (!guild) return;

				const cachedSuggestion = guild.suggestions.find(
					suggestion => suggestion.messageId == interaction.message.id
				);
				if (!cachedSuggestion) return;

				const channel = await interaction.guild.channels.fetch(cachedSuggestion.channelId);
				if (!channel || channel.type != "GUILD_TEXT") return;

				const thread = await channel.threads.fetch(cachedSuggestion.threadId);
				if (!thread) return;

				await interaction.deferUpdate();

				const message = await channel.messages.fetch(cachedSuggestion.messageId);
				const embed = message.embeds[0];
				const statusField = embed.fields.find(field => field.name == "Status");
				if (!statusField) return;

				statusField.value = `Denied by <@${interaction.user.id}>`;

				const row = new MessageActionRow();
				if (suggest.buttons) {
					for (const button of suggest.buttons.map(data => data.button)) {
						if (button.customId == "denySuggestion") {
							button.setDisabled(true);
						} else {
							button.setDisabled(false);
						}
						row.addComponents(button);
					}
				}

				await message.edit({
					embeds: [embed],
					components: [row],
				});

				cachedSuggestion.status = "denied";
				await guild.updateSuggestion(cachedSuggestion);
			},
			permissions: [Permissions.FLAGS.MANAGE_MESSAGES],
		},
	],
};

export default suggest;
