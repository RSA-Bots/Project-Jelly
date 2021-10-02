import { ButtonInteraction, MessageActionRow, MessageButton, MessageEmbed, Permissions } from "discord.js";
import { getGuild, guildCache } from "../globals";
import type { Command } from "../types/command";
import type { Report } from "../types/report";

const report: Command = {
	name: "report",
	interaction: {
		description: "Create a report against a user.",
		options: [
			{
				type: "USER",
				name: "user",
				description: "The user to report.",
				required: true,
			},
			{
				type: "STRING",
				name: "reason",
				description: "Additional context to the problem in the form of a description or screenshot.",
				required: true,
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
				!report.buttons
			)
				return;

			const guild = await getGuild(interaction.guildId);
			if (!guild) return;

			const guildInfo = guildCache.find(guild => guild.id == interaction.guildId);
			if (!guildInfo) return;

			const bot = interaction.guild.me;
			const uploadChannel =
				(await interaction.guild.channels.fetch(guild.settings.reports.upload)) ?? interaction.channel;

			if (
				!uploadChannel ||
				uploadChannel.type != "GUILD_TEXT" ||
				!bot ||
				!bot.permissionsIn(uploadChannel).has("VIEW_CHANNEL") ||
				!bot.permissionsIn(uploadChannel).has("SEND_MESSAGES")
			)
				return;

			const newReport: Report = {
				id: guildInfo.reports.length.toString(),
				messageId: "",
				channelId: "",
				threadId: "",
				status: "open",
				author: {
					id: interaction.user.id,
					time: new Date().toLocaleString(),
				},
				closed: {
					id: "",
					time: "",
				},
			};
			await guild.uploadReport(newReport);

			const accusedUser = interaction.options.getUser("user");
			const reason = interaction.options.getString("reason");
			const avatarURL = interaction.user.avatarURL();
			if (!accusedUser || !reason || !avatarURL) return;

			const row = new MessageActionRow();
			report.buttons.forEach(data => {
				if (data.button.customId == "closeReport") {
					row.addComponents(data.button);
				}
			});

			const embed = new MessageEmbed()
				.setAuthor(interaction.user.username + "#" + interaction.user.discriminator, avatarURL)
				.addField("Accused", `<@${accusedUser.id}>`, true)
				.addField("Reason", reason, true)
				.addField("Status", "Open", false)
				.setFooter(`id: ${newReport.id}`)
				.setTimestamp()
				.setColor(interaction.member.displayColor)
				.setThumbnail("https://i.imgur.com/218ml3x.png");

			const message = await uploadChannel.send({
				embeds: [embed],
				components: [row],
			});

			const thread = await uploadChannel.threads.create({
				startMessage: message,
				name: `Report ${newReport.id}`,
				autoArchiveDuration: 1440,
				type: "GUILD_PUBLIC_THREAD",
			});

			(newReport.threadId = thread.id),
				(newReport.messageId = message.id),
				(newReport.channelId = message.channelId);

			await guild.updateReport(newReport);

			await interaction.reply({
				ephemeral: true,
				content: `<@${accusedUser.id}> has been reported.`,
			});
		},
	},
	buttons: [
		{
			button: new MessageButton()
				.setCustomId("closeReport")
				.setLabel("Close")
				.setStyle("DANGER")
				.setDisabled(false),
			callback: async (interaction: ButtonInteraction): Promise<void> => {
				if (!interaction.guildId || !interaction.guild) return;

				const guild = await getGuild(interaction.guildId);
				if (!guild) return;

				const cachedReport = guild.reports.find(report => report.messageId == interaction.message.id);
				if (!cachedReport) return;

				const channel = await interaction.guild.channels.fetch(cachedReport.channelId);
				if (!channel || channel.type != "GUILD_TEXT") return;

				const thread = await channel.threads.fetch(cachedReport.threadId);
				if (!thread) return;

				await interaction.deferUpdate();

				if (thread.archived == false) {
					await thread.setArchived(true); // Does not rely on threadUpdate due to the nature of collecting data from a closed ticket.
				}

				const message = await channel.messages.fetch(cachedReport.messageId);
				const embed = message.embeds[0];
				const statusField = embed.fields.find(field => field.name == "Status");
				if (!statusField) return;

				statusField.value = `Closed by <@${interaction.user.id}>`;

				const row = new MessageActionRow();
				if (report.buttons) {
					for (const button of report.buttons.map(data => data.button)) {
						if (button.customId == "openReport") {
							row.addComponents(button);
						}
					}
				}

				await message.edit({
					embeds: [embed],
					components: [row],
				});

				cachedReport.closed = {
					id: interaction.user.id,
					time: new Date().toLocaleString(),
				};
				cachedReport.status = "closed";
				await guild.updateReport(cachedReport);
			},
			permissions: [Permissions.FLAGS.MANAGE_MESSAGES],
		},
		{
			button: new MessageButton()
				.setCustomId("openReport")
				.setLabel("Open")
				.setStyle("PRIMARY")
				.setDisabled(false),
			callback: async (interaction: ButtonInteraction): Promise<void> => {
				if (!interaction.guildId || !interaction.guild) return;

				const guild = await getGuild(interaction.guildId);
				if (!guild) return;

				const cachedReport = guild.reports.find(report => report.messageId == interaction.message.id);
				if (!cachedReport) return;

				const channel = await interaction.guild.channels.fetch(cachedReport.channelId);
				if (!channel || channel.type != "GUILD_TEXT") return;

				const thread = await channel.threads.fetch(cachedReport.threadId);
				if (!thread) return;

				await interaction.deferUpdate();

				if (thread.archived == true) {
					await thread.setArchived(false); // Relies on threadUpdate
				}
			},
			permissions: [Permissions.FLAGS.MANAGE_MESSAGES],
		},
	],
};

export default report;
