import type { Message } from "discord.js";
import type { Command } from "../types/command";

const ping: Command = {
	Name: "ping",
	Config: {
		Enabled: true,
	},

	Execute: async (Message: Message, Args: string[]) => {
		await Message.reply("Pong");
	},
};

export { ping };
