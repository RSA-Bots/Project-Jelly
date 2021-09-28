import type { Client } from "discord.js";
import { getGuild, linkCommands, linkSlashCommands } from "../globals";
import { version } from "../package.json";
import type { Event } from "../types/event";

const ready: Event<"Client"> = {
	name: "ready",
	once: true,
	callback: async (client: Client) => {
		await linkCommands();
		for (const guild of (await client.guilds.fetch()).map(guild => client.guilds.cache.get(guild.id))) {
			if (guild) {
				await getGuild(guild.id);
				await linkSlashCommands(guild);
			}
		}

		console.log(`Client is ready, running version: ${version}`);
	},
};

export default ready;
