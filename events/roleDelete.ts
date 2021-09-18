import type { Role } from "discord.js";
import type { Event } from "../types/event";

const roleDelete: Event<"Role"> = {
	name: "roleDelete",
	once: false,

	callback: async (role: Role) => {
		if (role) {
			const guild = role.guild;

			for (const slashCommand of (await guild.commands.fetch()).map(command => command)) {
				if (await slashCommand.permissions.has({ permissionId: role.id })) {
					void slashCommand.permissions
						.remove({
							roles: role.id,
						})
						.catch(console.log);
				}
			}
		}
	},
};

export default roleDelete;
