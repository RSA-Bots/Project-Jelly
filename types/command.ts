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
		options?: ApplicationCommandOption[];
		permissions?: ApplicationCommandPermissionData[];
		defaultPermission: boolean;
		enabled: boolean;
		callback: (interaction: CommandInteraction) => void;
	};
	message?: {
		enabled: boolean;
		callback: (message: Message, args: string[]) => void;
	};
	buttons?: {
		button: MessageButton;
		callback: (interaction: ButtonInteraction) => void;
		permissions?: PermissionResolvable[];
	}[];
	menus?: {
		menu: MessageSelectMenu;
		callback: (interaction: SelectMenuInteraction) => void;
		permissions?: PermissionResolvable[];
	}[];
	permissions?: PermissionResolvable[];
};
