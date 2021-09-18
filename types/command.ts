import type {
	ApplicationCommandOption,
	ApplicationCommandPermissionData,
	Interaction,
	Message,
	PermissionResolvable,
} from "discord.js";
export interface Command {
	name: string;
	interaction: {
		description: string;
		options: ApplicationCommandOption[];
		permissions?: ApplicationCommandPermissionData[];
		defaultPermission: boolean;
		enabled: boolean;
	};
	message: {
		enabled: boolean;
	};
	permissions?: PermissionResolvable[];
	callback: (...args: [Message | Interaction, string[]?]) => void;
}
