import type { Client, Role } from "discord.js";
import type { Collection } from "mongodb";
import { getCommands } from "../globals";
import type { Event } from "../types/event";

const roleUpdate: Event<Role> = {
	name: "roleUpdate",
	config: {
		enabled: true,
	},

	execute: async (bot: Client, userData: Collection, oldRole?: Role, newRole?: Role) => {
		if (oldRole && newRole) {
			const guild = newRole.guild;
			const slashCommands = guild.commands.fetch();
			const commands = await getCommands();

			for (const slashCommand of (await slashCommands).map(command => command)) {
				const command = commands.find(command => slashCommand.name == command.name);

				if (command && command.permissions) {
					let hasAllPermissions = true;
					for (const permission of command.permissions) {
						if (!newRole.permissions.has(permission)) {
							hasAllPermissions = false;
						}
					}

					if (hasAllPermissions) {
						void slashCommand.permissions
							.add({
								permissions: [
									{
										id: newRole.id,
										type: "ROLE",
										permission: true,
									},
								],
							})
							.catch(error => console.log(error));
					} else if (await slashCommand.permissions.has({ permissionId: newRole.id })) {
						void slashCommand.permissions
							.remove({
								roles: newRole.id,
							})
							.catch(error => console.log(error));
					}
				}
			}
		}
	},
};

export { roleUpdate };
