import { Command } from "../types/command";
import { deleteGuilds } from "../types/guild";
import { deleteUser, deleteUsers, userCache } from "../types/user";

new Command("delete").registerCommand({
	type: "messageCommand",
	whitelist: ["454873852254617601"],
	callback: async (message, args) => {
		if (args) {
			switch (args.shift()) {
				case "users": {
					await deleteUsers();
					await message.reply({
						content: "All user entries have been deleted.",
					});
					break;
				}
				case "user": {
					const users = message.mentions.users;
					const id = args.shift();

					if (users.size > 0) {
						const target = users.first();
						if (target) {
							await deleteUser(target.id);
							await message.reply({
								content: `User entry for \`${target.id}\` has been deleted.`,
							});
						}
					} else if (id) {
						const target = userCache.find(user => user.cache.id == id);
						if (target) {
							await deleteUser(target.cache.id);
							await message.reply({
								content: `User entry for \`${target.cache.id}\` has been deleted.`,
							});
						}
					}
					break;
				}
				case "guilds": {
					await deleteGuilds();
					await message.reply({
						content: "All guild entries have been deleted.",
					});
					break;
				}
			}
		}
	},
});
