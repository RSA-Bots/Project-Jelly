import type { CommandInteraction, Interaction, Message } from "discord.js";
import { Permissions } from "discord.js";
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
		enabled: true,
	},
	permissions: [Permissions.FLAGS.ADMINISTRATOR],

	callback: async (data: Message | Interaction) => {
		switch (data.type) {
			case "APPLICATION_COMMAND": {
				const interaction = data as CommandInteraction;

				await interaction.reply(`Pinged by user id: ${interaction.user.id}`).catch(console.log);
				break;
			}
			default: {
				const message = data as Message;

				await message.reply(`Pinged by user id: ${message.member?.id as string}`).catch(console.log);
			}
		}
	},
};

export default ping;
