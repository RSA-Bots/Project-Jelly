import type { Message } from "discord.js";
import { commands } from "../types/command";
import { Event } from "../types/event";
import { getUser, updateUsername } from "../types/user";

new Event<Message>("messageCreate", false, async message => {
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
			const whitelist = command.events.messageCommand.whitelist;
			const isWhitelisted = whitelist ? whitelist.includes(message.author.id) : false;

			if (hasPermissions && (isWhitelisted || !whitelist)) {
				command.events.messageCommand.callback(message, args);
			}
		}
	}

	if (message.author.bot == false) {
		const user = await getUser(message.author.id);
		await updateUsername(user.cache.id, message.author.username);

		if (message.content.startsWith(user.cache.prefix)) {
			const content = message.content.slice(user.cache.prefix.length);
			const args = content.split(" ");

			parseCommand(args);
		}
	}
});
