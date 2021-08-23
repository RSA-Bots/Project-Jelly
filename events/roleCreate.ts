import type { Client, Role } from "discord.js";
import type { Collection } from "mongodb";
import { getCommands } from "../globals";
import type { Event } from "../types/event";

const roleCreate: Event<Role> = {
	name: "roleCreate",
	config: {
		enabled: true,
	},

	execute: async (bot: Client, userData: Collection, role?: Role) => {
		if (role) {
			const guild = role.guild;
			const slashCommands = guild.commands.fetch();
			const commands = await getCommands();

			for (const slashCommand of (await slashCommands).map(command => command)) {
				const command = commands.find(command => slashCommand.name == command.name);

				if (command && command.permissions) {
					let hasAllPermissions = true;
					for (const permission of command.permissions) {
						if (!role.permissions.has(permission)) {
							hasAllPermissions = false;
						}
					}

					if (hasAllPermissions) {
						void slashCommand.permissions
							.add({
								permissions: [
									{
										id: role.id,
										type: "ROLE",
										permission: true,
									},
								],
							})
							.catch(error => console.log(error));
					}
				}
			}
		}
	},
};

export { roleCreate };
