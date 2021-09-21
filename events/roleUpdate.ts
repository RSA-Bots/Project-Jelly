import type { Role } from "discord.js";
import { getCommands } from "../globals";
import type { Event } from "../types/event";

const roleUpdate: Event<"Role"> = {
	name: "roleUpdate",
	once: false,

	callback: async (oldRole: Role, newRole: Role) => {
		if (oldRole && newRole) {
			const guild = newRole.guild;
			const commands = await getCommands();

			for (const slashCommand of (await guild.commands.fetch()).map(command => command)) {
				const command = commands.find(command => slashCommand.name == command.name);

				if (command && command.permissions) {
					const hasAllPermissions = command.permissions
						? newRole.permissions.has(command.permissions)
						: false;

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

export default roleUpdate;
