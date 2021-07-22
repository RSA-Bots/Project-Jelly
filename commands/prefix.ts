import type { Client, CommandInteraction, Interaction, Message } from "discord.js";
import type { Collection } from "mongodb";
import type { Command } from "../types/command";

const prefix: Command = {
	Name: "prefix",
	Description: "Changes your prefix",
	Options: [
		{
			name: "input",
			type: "STRING",
			description: "The prefix you want to change to",
			required: true,
		},
	],
	Config: {
		Enabled: true,
		Authority: 0,
		IsSlashCommand: true,
	},

	Execute: (Bot: Client, UserData?: Collection, Data?: Message | Interaction, Args?: string[]) => {
		async function SetPrefix(DiscordID: string, Prefix: string) {
			if (UserData) {
				await UserData.findOneAndUpdate(
					{ DiscordID: DiscordID },
					{
						$set: {
							Prefix: Prefix,
						},
					}
				);
			}
		}

		if (Data) {
			switch (Data.type) {
				case "APPLICATION_COMMAND": {
					const Interaction = Data as CommandInteraction;
					const Input = Interaction.options.get("input")?.value;
					if (typeof Input == "string") {
						void SetPrefix(Interaction.user.id, Input.substr(0, 2));
					}
					break;
				}
				default: {
					const Message = Data as Message;
					if (Args && Args[0]) {
						void SetPrefix(Message.author.id, Args[0].substr(0, 2));
					}
				}
			}
		}
	},
};

export { prefix };
