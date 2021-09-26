import { getClient, getGuild, linkCommands, linkSlashCommands } from "../globals";
import { version } from "../package.json";
import type { Event } from "../types/event";

const ready: Event<"void"> = {
	name: "ready",
	once: true,
	callback: async () => {
		await linkCommands();
		await linkSlashCommands();

		for (const guild of (await getClient().guilds.fetch()).map(guild => guild)) {
			await getGuild(guild.id);
		}

		console.log(`Client is ready, running version: ${version}`);
	},
};

export default ready;
