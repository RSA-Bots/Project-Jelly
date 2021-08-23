import type { Client, CommandInteraction, Interaction, Message } from "discord.js";
import type { Collection } from "mongodb";
import type { Command } from "../types/command";

const ping: Command = {
	name: "ping",
	interaction: {
		description: "Sends back ping.",
		options: [],
		permissions: [],
		defaultPermission: false,
		enabled: true,
	},
	message: {
		authority: 0,
		enabled: true,
	},
	permissions: [],

	execute: async (bot: Client, userData?: Collection, data?: Message | Interaction) => {
		if (data) {
			switch (data.type) {
				case "APPLICATION_COMMAND": {
					const interaction = data as CommandInteraction;
					await interaction.reply("Hello");
					break;
				}
				default: {
					const message = data as Message;
					await message.reply("Holo");
				}
			}
		}
	},
};

export { ping };
