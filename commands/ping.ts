import type { Message } from "discord.js";
import type { Command } from "../types/command";

const ping: Command = {
	Name: "ping",
	Config: {
		Enabled: true,
	},

	Execute: (Message: Message, ...Args: string[]) => {
		console.log(Message.content, Args);
	},
};

export { ping };
