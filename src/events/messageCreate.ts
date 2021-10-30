import type { Message } from "discord.js";
import { commands, getUser } from "../globals";
import type { Event } from "../types/event";

const messageCreate: Event<Message> = {
	name: "messageCreate",
	once: false,

	callback: async (message: Message) => {
		if (message.author.bot == false) {
			const user = await getUser(message.author.id);
			if (!user || !message.member) return;

			if (message.content.startsWith(user.prefix)) {

				const content: string = message.content.split(user.prefix)[1];
				const args: string[] = content.split(" ");
				let request: string | undefined = args.shift();
				if (request) {
					request = request.toLowerCase();
				}

				const command = commands.find(command => command.name == request);

				if (command && command.events.messageCommand) {
					const hasPermissions = command.permissions ? message.member.permissions.has(command.permissions) : true;

					if (hasPermissions) {
						command.events.messageCommand.callback(message, args);
					}
				}
			}
		}
	},
};

export default messageCreate;
