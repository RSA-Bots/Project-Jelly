import type { Client, CommandInteraction, Interaction, Message } from "discord.js";
import type { Collection } from "mongodb";
import type { Command } from "../types/command";

const ping: Command = {
	Name: "ping",
	Description: "Sends back ping",
	Options: [],
	Config: {
		Enabled: true,
		Authority: 0,
		IsSlashCommand: false,
	},

	Execute: async (Bot: Client, UserData?: Collection, Data?: Message | Interaction) => {
		if (Data) {
			switch (Data.type) {
				case "APPLICATION_COMMAND": {
					const Interaction = Data as CommandInteraction;
					await Interaction.reply("Hello");
					break;
				}
				default: {
					const Message = Data as Message;
					await Message.reply("Holo");
				}
			}
		}
	},
};

export { ping };
