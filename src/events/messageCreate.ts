import type { Message } from "discord.js";
import { commands } from "../types/command";
import { Event } from "../types/event";
import { getUser } from "../types/user";

new Event<Message>("messageCreate", false, async (message: Message) => {
	function parseCommand(args: string[]) {
		if (!message.member) return;

		const commandName = args.shift()?.toLowerCase() ?? "";

		const command = commands.find(command => {
			if (command.events.messageCommand) {
				if (command.name == commandName) {
					return command;
				} else if (
					command.events.messageCommand &&
					command.events.messageCommand.aliases &&
					command.events.messageCommand.aliases.includes(commandName)
				) {
					return command;
				}
			}
			return;
		});

		if (command && command.events.messageCommand) {
			const hasPermissions = command.permissions ? message.member.permissions.has(command.permissions) : true;

			if (hasPermissions) {
				command.events.messageCommand.callback(message, args);
			}
		}
	}

	if (message.author.bot == false) {
		if (!message.guildId) return;

		const user = await getUser(message.author.id);

		if (message.content.startsWith(user.cache.prefix)) {
			const content = message.content.slice(user.cache.prefix.length);
			const args = content.split(" ");

			parseCommand(args);
		}
	}
});
