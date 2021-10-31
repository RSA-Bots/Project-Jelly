import type {
	ApplicationCommandOptionData,
	ApplicationCommandPermissionData,
	ButtonInteraction,
	CommandInteraction,
	Message,
	MessageButton,
	MessageSelectMenu,
	PermissionResolvable,
	SelectMenuInteraction,
} from "discord.js";

import { commands } from "../globals";

export type SlashCommand = {
	description: string;
	defaultPermission: boolean;
	options?: ApplicationCommandOptionData[];
	permissions?: ApplicationCommandPermissionData[];
	callback: (interaction: CommandInteraction) => void;
	ephemeralReply?: boolean;
	type: "slashCommand";
};

export type MessageCommand = {
	aliases?: string[];
	callback: (message: Message, args?: string[]) => void;
	type: "messageCommand";
};

export type Button = {
	object: MessageButton;
	callback: (interaction: ButtonInteraction) => void;
	permissions?: PermissionResolvable[];
};

export type Menu = {
	object: MessageSelectMenu;
	callback: (interaction: SelectMenuInteraction) => void;
	permissions?: PermissionResolvable[];
};
export class Command {
	readonly name: string;
	readonly events: {
		slashCommand?: SlashCommand;
		messageCommand?: MessageCommand;
	} = {};
	readonly buttons: Button[] = [];
	readonly menus: Menu[] = [];
	readonly permissions: PermissionResolvable[] = [];

	addButton(button: Button) {
		this.buttons.push(button);
		return this;
	}
	addButtons(buttons: Button[]) {
		for (const button of buttons) {
			this.buttons.push(button);
		}
		return this;
	}

	addMenu(menu: Menu) {
		this.menus.push(menu);
		return this;
	}
	addMenus(menus: Menu[]) {
		for (const menu of menus) {
			this.menus.push(menu);
		}
		return this;
	}

	setPermissions(permissions: PermissionResolvable[]) {
		for (const permission of permissions) {
			this.permissions.push(permission);
		}
		return this;
	}

	registerCommand(command: SlashCommand | MessageCommand) {
		if (command.type && command.type == "slashCommand") {
			this.events.slashCommand = command;
			if (!command.ephemeralReply) {
				this.events.slashCommand.ephemeralReply = true;
			}
		} else if (command.type && command.type == "messageCommand") {
			this.events.messageCommand = command;
		} else {
			console.error("Tried to register a command that is not of type slashCommand or of type messageCommand");
		}
		return this;
	}

	constructor(name: string) {
		this.name = name;

		commands.push(this);
		return this;
	}
}

const ping = new Command("ping");
ping.registerCommand({
	type: "messageCommand",
	aliases: ["pong"],
	callback: (a: Message) => {
		console.log(a);
	},
});
