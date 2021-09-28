import type { Message } from "discord.js";
import type { Document } from "mongoose";
import { getCommands, getUser } from "../globals";
import type { Event } from "../types/event";
import type { userData } from "../types/user";

const messageCreate: Event<"Message"> = {
	name: "messageCreate",
	once: false,

	callback: async (message: Message) => {
		if (message.author.bot == false) {
			const user = (await getUser(message.author.id)) as Document<userData> & userData;
			if (user && message.content.startsWith(user.prefix)) {
				const commands = await getCommands();

				const content: string = message.content.split(user.prefix)[1];
				const args: string[] = content.split(" ");
				let request: string | undefined = args.shift();
				if (request) {
					request = request.toLowerCase();
				}

				const query = commands.find(command => command.name.toLowerCase() == request);

				if (query && query.message && message.member) {
					const hasPermissions = query.permissions ? message.member.permissions.has(query.permissions) : true;

					if (hasPermissions) {
						query.message.callback(message, args);
					}
				}
			}
		}
	},
};

export default messageCreate;
