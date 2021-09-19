import type {
	ApplicationCommandOption,
	ApplicationCommandPermissionData,
	CommandInteraction,
	Message,
	PermissionResolvable,
} from "discord.js";
export interface Command {
	name: string;
	interaction?: {
		description: string;
		options: ApplicationCommandOption[];
		permissions?: ApplicationCommandPermissionData[];
		defaultPermission: boolean;
		enabled: boolean;
		callback: (interaction: CommandInteraction) => void;
	};
	message?: {
		enabled: boolean;
		callback: (message: Message, args: string[]) => void;
	};
	permissions?: PermissionResolvable[];
}
