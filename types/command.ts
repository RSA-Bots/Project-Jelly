import type { ApplicationCommandOption, Client, Interaction, Message } from "discord.js";
import type { Collection } from "mongodb";
export interface Command {
	Name: string;
	Description: string;
	Options: ApplicationCommandOption[];
	Config: {
		Enabled: boolean;
		Authority: number;
		IsSlashCommand: boolean;
	};
	Execute: (Bot: Client, UserData?: Collection, ...Args: [Message | Interaction, string[]?]) => void;
}
