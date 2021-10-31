import type { Message, SplitOptions } from "discord.js";
import { commands, getUser } from "../globals";
import type { Event } from "../types/event";

const messageCreate: Event<Message> = {
	name: "messageCreate",
	once: false,

	callback: async (message: Message) => {
		if (message.author.bot == false) {
			const user = await getUser(message.author.id);
			if (!user || !message.member) return;

			await user.updateLastMessage({
				content: message.content,
				time: Date.now().toLocaleString(),
			});
			await user.updateMessageCount(user.messageCount + 1);

			if (message.content.startsWith(user.prefix)) {
				const split = message.content.split(user.prefix);
				split.shift();

				const content = split.shift() ?? "";
				const args = content.split(" ");

				let request = args.shift() ?? "";
				request = request.toLowerCase();

				const command = commands.find(command => {
					if (command.name == request) {
						return command;
					} else {
						if (
							command.events.messageCommand &&
							command.events.messageCommand.aliases &&
							command.events.messageCommand.aliases.includes(request)
						) {
							return command;
						}
					}
					return;
				});

				if (command && command.events.messageCommand) {
					const hasPermissions = command.permissions
						? message.member.permissions.has(command.permissions)
						: true;

					if (hasPermissions) {
						await user.updateCommandCount(user.commandCount + 1);
						command.events.messageCommand.callback(message, args);
					}
				}
			}
		}
	},
};

export default messageCreate;
