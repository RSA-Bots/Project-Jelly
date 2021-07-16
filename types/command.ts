import type { Message } from "discord.js";

export interface Command {
	Name: string;
	Config: {
		Enabled: boolean;
	};
	Execute: (Message: Message, Args: string[]) => void;
}
