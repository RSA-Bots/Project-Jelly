import type { Client, Role } from "discord.js";
import type { Collection } from "mongodb";
import type { Event } from "../types/event";

const roleDelete: Event<Role> = {
	name: "roleDelete",
	config: {
		enabled: true,
	},

	execute: async (bot: Client, userData: Collection, role?: Role) => {
		if (role) {
			const guild = role.guild;
			const slashCommands = guild.commands.fetch();

			for (const slashCommand of (await slashCommands).map(command => command)) {
				if (await slashCommand.permissions.has({ permissionId: role.id })) {
					void slashCommand.permissions
						.remove({
							roles: role.id,
						})
						.catch(error => console.log(error));
				}
			}
		}
	},
};

export { roleDelete };
