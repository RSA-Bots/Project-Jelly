import type {
	ApplicationCommandOption,
	ApplicationCommandPermissionData,
	ButtonInteraction,
	CommandInteraction,
	Message,
	MessageButton,
	MessageSelectMenu,
	PermissionResolvable,
	SelectMenuInteraction,
} from "discord.js";

export type Command = {
	name: string;
	interaction?: {
		description: string;
		options: ApplicationCommandOption[];
		permissions?: ApplicationCommandPermissionData[];
		defaultPermission: boolean;
		enabled: boolean;
		callback: (interaction: CommandInteraction | ButtonInteraction | SelectMenuInteraction) => void;
	};
	message?: {
		enabled: boolean;
		callback: (message: Message, args: string[]) => void;
	};
	buttons?: {
		object: MessageButton;
		callback: (interaction: ButtonInteraction) => void;
	}[];
	menus?: {
		object: MessageSelectMenu;
		callback: (interaction: SelectMenuInteraction) => void;
	}[];
	permissions?: PermissionResolvable[];
};
