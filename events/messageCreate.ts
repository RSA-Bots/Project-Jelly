import type { Client, Message } from "discord.js";
import type { Collection } from "mongodb";
import { getCommands } from "../globals";
import type { Command } from "../types/command";
import type { Event } from "../types/event";
import { defaultUser } from "../types/user";

const messageCreate: Event<Message> = {
	name: "messageCreate",
	config: {
		enabled: true,
	},

	execute: async (bot: Client, userData: Collection, message?: Message) => {
		if (message && message.author.bot == false) {
			const guild = message.guild;
			const guildMember = message.member;

			if (guild && guildMember) {
				let user = await userData.findOne({ id: message.author.id });
				if (!user) {
					await userData.insertOne({
						id: message.author.id,
						prefix: defaultUser.prefix,
						authority: defaultUser.authority,
					});
					user = await userData.findOne({ id: message.author.id });
				}

				// Command parsing logic
				if (user && message.content.startsWith(user.prefix)) {
					const commands: Command[] = await getCommands();

					const content: string[] = message.content.split(user.prefix);
					const args: string[] = content[1].split(" ");
					const request: string | undefined = args.shift()?.toLowerCase();

					const query = commands.filter(command => {
						return command.name.toLowerCase() == request;
					});

					if (query.length > 0) {
						const request = query[0];

						if (request.message.authority <= user.authority && request.message.enabled) {
							request.execute(bot, userData, message, args);
						}
					}
				}
			}
		}
	},
};

export { messageCreate };
