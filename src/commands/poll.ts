import { GuildMember, MessageEmbed } from "discord.js"
import { getGuild, guildCache } from "../globals";
import { Command } from "../types/command";

//todo: Implement a way to show the leading result of a poll, maybe on the embed itself, as well as in the thread.

const numberToEmoji = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"]

const poll = new Command("poll").registerCommand({
	type: "SlashCommand",
	description: "Create a suggestion.",
	options: [
		{
			type: "BOOLEAN",
			name: "thread",
			description: "Would you like to create a discussion thread for this poll?",
			required: true
		},
		{
			type: "STRING",
			name: "question",
			description: "The question to represent the poll.",
			required: true
		},
		{
			type: "STRING",
			name: "option1",
			description: "An option for the poll.",
			required: true,
		},
		{
			type: "STRING",
			name: "option2",
			description: "An option for the poll.",
			required: true,
		},
		{
			type: "STRING",
			name: "option3",
			description: "An option for the poll.",
		},
		{
			type: "STRING",
			name: "option4",
			description: "An option for the poll.",
		},
		{
			type: "STRING",
			name: "option5",
			description: "An option for the poll.",
		},
		{
			type: "STRING",
			name: "option6",
			description: "An option for the poll.",
		},
		{
			type: "STRING",
			name: "option7",
			description: "An option for the poll.",
		},
		{
			type: "STRING",
			name: "option8",
			description: "An option for the poll.",
		},
		{
			type: "STRING",
			name: "option9",
			description: "An option for the poll.",
		},
	],
	defaultPermission: true,
	callback: async interaction => {
		if (
			!interaction.guildId ||
			!interaction.guild ||
			!(interaction.member instanceof GuildMember)
		)
			return;

		const guild = await getGuild(interaction.guildId);
		if (!guild) {
			await interaction.reply({
				ephemeral: true,
				content: "Could not find guild information."
			})
			return;
		}

		const guildInfo = guildCache.find(guild => guild.id == interaction.guildId);
		if (!guildInfo) {
			await interaction.reply({
				ephemeral: true,
				content: "Could not find cached guild information."
			})
			return;
		}

		const bot = interaction.guild.me;
		const uploadChannel = await interaction.guild.channels.fetch(guild.settings.polls.upload);

		if (!uploadChannel) {
			interaction.reply({ephemeral: true, content: "You must set a channel for polls to be uploaded to using the `/settings` command."})
			return
		}
		if (uploadChannel.type != "GUILD_TEXT" ||
			!bot ||
			!bot.permissionsIn(uploadChannel).has("VIEW_CHANNEL") ||
			!bot.permissionsIn(uploadChannel).has("SEND_MESSAGES") ||
			!bot.permissionsIn(uploadChannel).has("MANAGE_THREADS")
		) {
			await interaction.reply({ephemeral: true, content: "The bot does not have sufficient permissions in the upload channel for polls."})
			return
		}

		const avatarURL = interaction.user.avatarURL()
		if (!avatarURL) return;

		const question = interaction.options.getString("question")
		if (!question) return;

		const embed = new MessageEmbed()
			.setTitle(question)
			.setAuthor(interaction.user.username + "#" + interaction.user.discriminator, avatarURL)
			.setTimestamp()
			.setColor(interaction.member.displayColor)


		let description = ""
		for (let iterator = 1; iterator <= 9; iterator++) {
			const option = interaction.options.getString(`option${iterator}`)
			if (option) {
				switch(description.length) {
					case 0: {
						description = `${numberToEmoji[iterator - 1]} ${option}\n`
						break
					}
					default: {
						description += `\n${numberToEmoji[iterator - 1]} ${option}\n`
						break
					}
				}
			}
		}
		embed.setDescription(description)

		await interaction.deferReply({ephemeral: true})

		const message = await uploadChannel.send({embeds: [embed]})
		for (let iterator = 1; iterator <= 9; iterator++) {
			const option = interaction.options.getString(`option${iterator}`)
			if (option) {
				await message.react(numberToEmoji[iterator - 1])
			}
		}

		if (interaction.options.getBoolean("thread")) {
			const thread = await uploadChannel.threads.create({
				startMessage: message,
				name: question,
				autoArchiveDuration: 1440,
				type: "GUILD_PUBLIC_THREAD",
			});
			await interaction.editReply({
				content: `Poll has been created, discussion can be found at <#${thread.id}>.`,
			});
		} else {
			await interaction.editReply({
				content: "Poll has been created.",
			});
		}
	},
})

export default poll;
