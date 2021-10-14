import { ButtonInteraction, GuildMember, MessageActionRow, MessageButton, MessageEmbed, Permissions } from "discord.js"
import { getGuild, guildCache } from "../globals";
import type { Command } from "../types/command";

const numberWords = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"]

const poll: Command = {
	name: "poll",
	interaction: {
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
		enabled: true,
		callback: async interaction => {
			if (
				!interaction.guildId ||
				!interaction.guild ||
				!(interaction.member instanceof GuildMember)
			)
				return;

			const guild = await getGuild(interaction.guildId);
			if (!guild) return;

			const guildInfo = guildCache.find(guild => guild.id == interaction.guildId);
			if (!guildInfo) return;

			const bot = interaction.guild.me;
			const uploadChannel = await interaction.guild.channels.fetch(guild.settings.polls.upload);

			if (!uploadChannel) {
				interaction.reply({ephemeral: true, content: "You must set a channel for polls to be uploaded to using the `/settings` command."})
				return
			}
			if (uploadChannel.type != "GUILD_TEXT" ||
				!bot ||
				!bot.permissionsIn(uploadChannel).has("VIEW_CHANNEL") ||
				!bot.permissionsIn(uploadChannel).has("SEND_MESSAGES")
			)
				return;

			const avatarURL = interaction.user.avatarURL()
			if (!avatarURL) return;

			const question = interaction.options.getString("question")
			if (!question) return;

			const embed = new MessageEmbed()
				.setTitle(question)
				.setAuthor(interaction.user.username + "#" + interaction.user.discriminator, avatarURL)
				.setTimestamp()
				.setColor(interaction.member.displayColor)
				.setThumbnail("https://i.imgur.com/uFuYM5I.png");


			let description = ""
			for (let iterator = 1; iterator <= 9; iterator++) {
				const option = interaction.options.getString(`option${iterator}`)
				if (option) {
					switch(description.length) {
						case 0: {
							description = `${numberWords[iterator - 1]} ${option}`
							break
						}
						default: {
							description += `\n${numberWords[iterator - 1]} ${option}`
							break
						}
					}
				}
			}
			embed.setDescription(description)

			const message = await uploadChannel.send({embeds: [embed]})
			for (let iterator = 1; iterator <= 9; iterator++) {
				const option = interaction.options.getString(`option${iterator}`)
				if (option) {
					await message.react(numberWords[iterator - 1])
				}
			}

			if (interaction.options.getBoolean("thread")) {
				await uploadChannel.threads.create({
					startMessage: message,
					name: question,
					autoArchiveDuration: 1440,
					type: "GUILD_PUBLIC_THREAD",
				});
			}


			await interaction.reply({
				ephemeral: true,
				content: "Poll has been created successfully.",
			});
		},
	},
};

export default poll;
