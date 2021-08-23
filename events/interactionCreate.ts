import type { Client, Interaction } from "discord.js";
import type { Collection } from "mongodb";
import { getCommands } from "../globals";
import type { Command } from "../types/command";
import type { Event } from "../types/event";
import { defaultUser } from "../types/user";

const interactionCreate: Event<Interaction> = {
	name: "interactionCreate",
	config: {
		enabled: true,
	},

	execute: async (bot: Client, userData: Collection, interaction?: Interaction) => {
		if (interaction) {
			const guild = interaction.guild;
			const guildMember = interaction.member;

			if (guildMember && guild) {
				let user = await userData.findOne({ id: guildMember.user.id });
				if (!user) {
					await userData.insertOne({
						id: guildMember.user.id,
						prefix: defaultUser.prefix,
						authority: defaultUser.authority,
					});
					user = await userData.findOne({ id: guildMember.user.id });
				}

				// Interaction parsing logic
				if (user && interaction.isCommand()) {
					const commands: Command[] = await getCommands();

					const query = commands.filter(command => {
						return command.name.toLowerCase() == interaction.commandName;
					});

					if (query.length > 0) {
						const request = query[0];

						if (request.interaction.enabled) {
							request.execute(bot, userData, interaction);
						} else {
							await interaction
								.reply({
									content: "You do not meet the requirements to use this command.",
									ephemeral: true,
								})
								.catch(Error => console.log(Error));
						}
					}
				}
			}
		}
	},
};

export { interactionCreate };
