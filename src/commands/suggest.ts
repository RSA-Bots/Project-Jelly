import {
	ButtonInteraction,
	GuildMember,
	Message,
	MessageActionRow,
	MessageButton,
	MessageEmbed,
	Permissions,
} from "discord.js";
import { Command } from "../types/command";
import { getGuild, guildCache, updateSettings, updateSuggestion, uploadSuggestion } from "../types/guild";
import type { Suggestion } from "../types/suggestion";
import { getUser, updateAnalytics, userCache } from "../types/user";

const suggest = new Command("suggest")
	.registerCommand({
		type: "slashCommand",
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
			{
				type: "BOOLEAN",
				name: "thread",
				description: "Create a discussion thread for this suggestion?",
			},
		],
		defaultPermission: true,
		callback: async interaction => {
			await interaction.deferReply({ ephemeral: true });

			if (!interaction.guild || !(interaction.member instanceof GuildMember) || !suggest.buttons) return;

			const guild = await getGuild(interaction.guildId);
			const user = await getUser(interaction.user.id);

			const bot = interaction.guild.me;
			const uploadChannel = await interaction.guild.channels.fetch(
				guild.cache.settings.suggestions.upload.default.id
			);

			if (uploadChannel == null) {
				interaction.editReply({
					content: "You must set a channel for suggestions to be uploaded to using the `/settings` command.",
				});
				return;
			} else if (uploadChannel.type != "GUILD_TEXT") {
				await interaction.editReply({
					content: "Upload channel for suggestions is not a valid text channel.",
				});
				return;
			} else if (
				!bot ||
				!bot.permissionsIn(uploadChannel).has("VIEW_CHANNEL") ||
				!bot.permissionsIn(uploadChannel).has("SEND_MESSAGES") ||
				!bot.permissionsIn(uploadChannel).has("MANAGE_THREADS")
			) {
				await interaction.editReply({
					content: "The bot does not have sufficient permissions in the upload channel for suggestions.",
				});
				return;
			}

			const description = interaction.options.getString("description");
			if (!description) return;

			const upload: Suggestion = {
				id: (guild.cache.suggestions.length + 1).toString(),
				messageId: "",
				channelId: "",
				threadId: "",
				status: "open",
				author: {
					id: interaction.user.id,
					time: new Date().toLocaleString(),
				},
				content: description,
				comment: "",
				isPopular: false,
			};
			await uploadSuggestion(interaction.guildId, upload);

			const avatarURL = interaction.user.avatarURL();
			if (!avatarURL) return;

			const row = new MessageActionRow();
			if (suggest.buttons) {
				suggest.buttons.forEach(button => {
					if (
						button.object.customId != "completeSuggestion" &&
						button.object.customId != "removeSuggestion"
					) {
						button.object.setDisabled(false);
						row.addComponents(button.object);
					}
				});
			} else {
				console.error("The buttons for this command have not been setup properly.");
				return;
			}

			const embed = new MessageEmbed()
				.setAuthor(interaction.user.username + "#" + interaction.user.discriminator, avatarURL)
				.setDescription(description)
				.addField("Status", "Open", true)
				.setFooter(`id: ${upload.id}`)
				.setTimestamp()
				.setColor(interaction.member.displayColor);

			const link = interaction.options.getString("link");
			if (link && (link.startsWith("https://") || link.startsWith("http://") || link.startsWith("www."))) {
				embed.addField("Additional Context", link, true);
			}

			const message = await uploadChannel.send({
				embeds: [embed],
				components: [row],
			});
			await message.react("👍"), await message.react("👎");

			(upload.messageId = message.id), (upload.channelId = message.channelId);

			if (interaction.options.getBoolean("thread")) {
				const thread = await uploadChannel.threads.create({
					startMessage: message,
					name: `Suggestion ${upload.id}`,
					autoArchiveDuration: 1440,
					type: "GUILD_PUBLIC_THREAD",
				});
				upload.threadId = thread.id;
				await interaction.editReply({
					content: `Suggestion has been created, discussion can be found at <#${thread.id}>.`,
				});
			} else {
				await interaction.editReply({
					content: `Suggestion has been created.`,
				});
			}

			user.cache.analytics.createdSuggestions += 1;

			await updateSuggestion(interaction.guildId, upload);
			await updateAnalytics(interaction.user.id, user.cache.analytics);
		},
	})
	.addButtons([
		{
			object: new MessageButton().setCustomId("approveSuggestion").setLabel("Approve").setStyle("PRIMARY"),
			callback: async interaction => {
				await interaction.deferUpdate();
				if (!interaction.guild) return;

				const row = new MessageActionRow();
				const denyButton = suggest.buttons.find(button => button.object.customId == "denySuggestion");
				const completeButton = suggest.buttons.find(button => button.object.customId == "completeSuggestion");
				if (!denyButton || !completeButton) return;

				row.setComponents([completeButton.object, denyButton.object]);

				const message = await interaction.message;
				if (message instanceof Message) {
					const embed = message.embeds[0];
					const statusField = embed.fields.find(field => field.name == "Status");
					if (!statusField) return;

					statusField.value = `Approved`;

					await message.edit({
						embeds: [embed],
						components: [row],
					});
				}

				const guild = await getGuild(interaction.guildId);
				const index = guild.cache.suggestions.findIndex(
					suggestion => suggestion.messageId == interaction.message.id
				);
				if (!index) return;
				const suggestion = guild.cache.suggestions[index];
				const user = userCache.find(user => suggestion.author.id == user.cache.id);
				if (!user) return;

				if (suggestion.status == "denied") {
					user.cache.analytics.deniedSuggestions -= 1;
				}

				suggestion.status = "approved";
				user.cache.analytics.approvedSuggestions += 1;

				await updateAnalytics(user.cache.id, user.cache.analytics);
				await updateSuggestion(interaction.guildId, suggestion);
			},
			permissions: [Permissions.FLAGS.MANAGE_MESSAGES],
		},
		{
			object: new MessageButton().setCustomId("denySuggestion").setLabel("Deny").setStyle("DANGER"),
			callback: async interaction => {
				await interaction.deferUpdate();
				if (!interaction.guild) return;

				const row = new MessageActionRow();
				const approveButton = suggest.buttons.find(button => button.object.customId == "approveSuggestion");
				const removeButton = suggest.buttons.find(button => button.object.customId == "removeSuggestion");
				if (!approveButton || !removeButton) return;

				row.setComponents([approveButton.object, removeButton.object]);

				const message = await interaction.message;
				if (message instanceof Message) {
					const embed = message.embeds[0];
					const statusField = embed.fields.find(field => field.name == "Status");
					if (!statusField) return;

					statusField.value = `Denied`;

					await message.edit({
						embeds: [embed],
						components: [row],
					});
				}

				const guild = await getGuild(interaction.guildId);
				const index = guild.cache.suggestions.findIndex(
					suggestion => suggestion.messageId == interaction.message.id
				);
				if (!index) return;
				const suggestion = guild.cache.suggestions[index];
				const user = userCache.find(user => suggestion.author.id == user.cache.id);
				if (!user) return;

				if (suggestion.status == "approved") {
					user.cache.analytics.approvedSuggestions -= 1;
				}
				suggestion.status = "denied";
				user.cache.analytics.deniedSuggestions += 1;

				await updateAnalytics(user.cache.id, user.cache.analytics);
				await updateSuggestion(interaction.guildId, suggestion);
			},
			permissions: [Permissions.FLAGS.MANAGE_MESSAGES],
		},
		{
			object: new MessageButton().setCustomId("completeSuggestion").setLabel("Complete").setStyle("SUCCESS"),
			callback: async interaction => {
				await interaction.deferUpdate();
				if (!interaction.guild) return;

				const message = await interaction.message;
				if (message instanceof Message) {
					const embed = message.embeds[0];
					const statusField = embed.fields.find(field => field.name == "Status");
					if (!statusField) return;

					statusField.value = `Completed`;

					await message.edit({
						embeds: [embed],
						components: [],
					});
				}

				const guild = await getGuild(interaction.guildId);
				const index = guild.cache.suggestions.findIndex(
					suggestion => suggestion.messageId == interaction.message.id
				);
				if (!index) return;
				const suggestion = guild.cache.suggestions[index];

				suggestion.status = "completed";
				await updateSuggestion(interaction.guildId, suggestion);
			},
			permissions: [Permissions.FLAGS.MANAGE_MESSAGES],
		},
		{
			object: new MessageButton().setCustomId("removeSuggestion").setLabel("Remove").setStyle("DANGER"),
			callback: async interaction => {
				await interaction.deferUpdate();

				const message = await interaction.message;
				if (message instanceof Message) {
					await message.delete();
				}

				const guild = await getGuild(interaction.guildId);
				const index = guild.cache.suggestions.findIndex(
					suggestion => suggestion.messageId == interaction.message.id
				);
				if (!index) return;
				const suggestion = guild.cache.suggestions[index];

				suggestion.status = "removed";
				await updateSuggestion(interaction.guildId, suggestion);
			},
			permissions: [Permissions.FLAGS.MANAGE_MESSAGES],
		},
	]);

export default suggest;
