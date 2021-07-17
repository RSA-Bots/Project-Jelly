import type { Client, Message } from "discord.js";
import type { Collection } from "mongodb";
import { GetCommands } from "../globals";
import type { Command } from "../types/command";
import type { Event } from "../types/event";
import { DefaultUser } from "../types/user";

const message: Event<Message> = {
	Name: "message",
	Config: {
		Enabled: true,
	},

	Execute: async (Bot: Client, UserData: Collection, Message: Message) => {
		if (Message) {
			let User = await UserData.findOne({ DiscordID: Message.author.id });
			if (!User) {
				await UserData.insertOne({
					DiscordID: Message.author.id,
					Prefix: DefaultUser.Prefix,
					Authority: DefaultUser.Authority,
				});
				User = await UserData.findOne({ DiscordID: Message.author.id });
			}

			if (User && Message.content.startsWith(User.Prefix)) {
				const Commands: Command[] = await GetCommands();

				const Content: string[] = Message.content.split(User.Prefix);
				const Args: string[] = Content[1].split(" ");
				const Request: string | undefined = Args.shift()?.toLowerCase();

				const CommandRequest = Commands.filter(CommandObject => {
					return CommandObject.Name.toLowerCase() == Request;
				});

				if (CommandRequest.length > 0) {
					CommandRequest[0].Execute(UserData, Message, Args);
				}
			}
		}
	},
};

export { message };
