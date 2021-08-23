import type {
	ApplicationCommandOption,
	ApplicationCommandPermissionData,
	Client,
	Interaction,
	Message,
	PermissionResolvable,
} from "discord.js";
import type { Collection } from "mongodb";
export interface Command {
	name: string;
	interaction: {
		description: string;
		options: ApplicationCommandOption[];
		permissions: ApplicationCommandPermissionData[];
		defaultPermission: boolean;
		enabled: boolean;
	};
	message: {
		authority: number;
		enabled: boolean;
	};
	permissions?: PermissionResolvable[];
	execute: (bot: Client, userData?: Collection, ...args: [(Message | Interaction)?, string[]?]) => void;
}
