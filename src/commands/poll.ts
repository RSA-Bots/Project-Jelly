import { GuildMember, MessageEmbed, Permissions, TextChannel } from "discord.js";
import { Command } from "../types/command";
import { getGuild, guildCache } from "../types/guild";
import { getUser, updateStats } from "../types/user";

//todo: Implement a way to show the leading result of a poll, maybe on the embed itself, as well as in the thread.

const numberToEmoji = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];

new Command("poll")
	.registerCommand({
		type: "slashCommand",
		description: "Create a suggestion.",
		options: [
			{
				type: "STRING",
				name: "question",
				description: "The question to represent the poll.",
				required: true,
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
			{
				type: "BOOLEAN",
				name: "thread",
				description: "Create a discussion thread for this poll?",
			},
		],
		defaultPermission: true,
		callback: async interaction => {
			await interaction.deferReply({ ephemeral: true });

			if (
				!interaction.guild ||
				!(interaction.member instanceof GuildMember) ||
				!(interaction.channel instanceof TextChannel)
			)
				return;

			const user = await getUser(interaction.user.id);

			const avatarURL = interaction.user.avatarURL();
			if (!avatarURL) return;

			const question = interaction.options.getString("question");
			if (!question) return;

			const embed = new MessageEmbed()
				.setTitle(question)
				.setAuthor(interaction.user.username + "#" + interaction.user.discriminator, avatarURL)
				.setTimestamp()
				.setColor(interaction.member.displayColor);

			let description = "";
			for (let iterator = 1; iterator <= 9; iterator++) {
				const option = interaction.options.getString(`option${iterator}`);
				if (option) {
					switch (description.length) {
						case 0: {
							description = `${numberToEmoji[iterator - 1]} ${option}\n`;
							break;
						}
						default: {
							description += `\n${numberToEmoji[iterator - 1]} ${option}\n`;
							break;
						}
					}
				}
			}
			embed.setDescription(description);

			const message = await interaction.channel.send({ embeds: [embed] });
			for (let iterator = 1; iterator <= 9; iterator++) {
				const option = interaction.options.getString(`option${iterator}`);
				if (option) {
					await message.react(numberToEmoji[iterator - 1]);
				}
			}

			if (interaction.options.getBoolean("thread")) {
				const thread = await interaction.channel.threads.create({
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

			user.cache.stats.createdPolls += 1;
			await updateStats(interaction.user.id, user.cache.stats);
		},
	})
	.setPermissions([Permissions.FLAGS.MANAGE_GUILD]);
