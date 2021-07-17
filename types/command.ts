import type { Message } from "discord.js";
import type { Collection } from "mongodb";

export interface Command {
	Name: string;
	Config: {
		Enabled: boolean;
	};
	Execute: (UserData: Collection, Message: Message, Args: string[]) => void;
}
