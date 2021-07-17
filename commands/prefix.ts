import type { Message } from "discord.js";
import type { Collection } from "mongodb";
import type { Command } from "../types/command";

const prefix: Command = {
	Name: "prefix",
	Config: {
		Enabled: true,
	},

	Execute: async (UserData: Collection, Message: Message, Args: string[]) => {
		const Target: string = Args[0] || "!";

		await UserData.findOneAndUpdate(
			{ DiscordID: Message.author.id },
			{
				$set: {
					Prefix: Target.substr(0, 2),
				},
			}
		);
	},
};

export { prefix };
