import type { Role } from "discord.js";
import { getCommands } from "../globals";
import type { Event } from "../types/event";

const roleCreate: Event<"Role"> = {
	name: "roleCreate",
	once: false,

	callback: async (role: Role) => {
		if (role) {
			const guild = role.guild;
			const commands = await getCommands();

			for (const slashCommand of (await guild.commands.fetch()).map(command => command)) {
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
							.catch(console.log);
					}
				}
			}
		}
	},
};

export default roleCreate;
