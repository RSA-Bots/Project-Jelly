import type { Client, Message } from "discord.js";
import { GetCommands } from "../globals";
import Settings from "../settings.json";
import type { Command } from "../types/command";
import type { Event } from "../types/event";

const message: Event<Message> = {
	Name: "message",
	Config: {
		Enabled: true,
	},

	Execute: async (Bot: Client, Message: Message) => {
		const Commands: Command[] = await GetCommands();

		if (Message && Message.content.startsWith(Settings.Prefix)) {
			const Content: string[] = Message.content.split(Settings.Prefix);
			const Args: string[] = Content[1].split(" ");
			const Request: string | undefined = Args.shift();

			const CommandRequest = Commands.filter(CommandObject => {
				return CommandObject.Name == Request;
			});

			if (CommandRequest.length > 0) {
				CommandRequest[0].Execute(Message, ...Args);
			}
		}
	},
};

export { message };
