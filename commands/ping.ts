import type { Message } from "discord.js";
import { MessageEmbed } from "discord.js";
import type { Collection } from "mongodb";
import type { Command } from "../types/command";

const ping: Command = {
	Name: "ping",
	Config: {
		Enabled: true,
	},

	Execute: async (UserData: Collection, Message: Message, Args: string[]) => {
		const Embed: MessageEmbed = new MessageEmbed().setDescription("Pong");
		await Message.channel.send(Embed);
	},
};

export { ping };
