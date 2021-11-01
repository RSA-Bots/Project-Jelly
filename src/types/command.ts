import type {
	ApplicationCommandData,
	ApplicationCommandOptionData,
	ApplicationCommandPermissionData,
	ButtonInteraction,
	CommandInteraction,
	Guild,
	Message,
	MessageButton,
	MessageSelectMenu,
	PermissionResolvable,
	SelectMenuInteraction,
} from "discord.js";
import { readdirSync } from "fs";

export const commands: Command[] = [];

export type SlashCommand = {
	description: string;
	defaultPermission: boolean;
	options?: ApplicationCommandOptionData[];
	permissions?: ApplicationCommandPermissionData[];
	callback: (interaction: CommandInteraction) => void;
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

export async function linkCommands(): Promise<void> {
	const commandFiles = readdirSync("./src/commands/");
	for (const command of commandFiles) {
		await import(`../commands/${command.split(".").shift()}`);
	}
}

export async function linkSlashCommands(guild: Guild): Promise<void> {
	const slashCommands: ApplicationCommandData[] = [];
	for (const command of commands) {
		if (command.events.slashCommand) {
			slashCommands.push({
				name: command.name,
				options: command.events.slashCommand.options,
				description: command.events.slashCommand.description,
				defaultPermission: command.events.slashCommand.defaultPermission,
			});
		}
	}

	const registeredCommands = await guild.commands.set(slashCommands);
	for (const command of commands) {
		const registeredCommand = registeredCommands.find(slashCommand => slashCommand.name == command.name);
		if (command.events.slashCommand && command.events.slashCommand.permissions && registeredCommand) {
			registeredCommand.permissions.set({
				permissions: command.events.slashCommand.permissions,
			});
		}
	}
}
