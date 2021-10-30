import type { Client, Guild } from "discord.js";
import { getVersion, getGuild, linkCommands, linkSlashCommands } from "../globals";
import type { Event } from "../types/event";

const ready: Event<Client> = {
	name: "ready",
	once: true,
	callback: async (client: Client) => {
		await linkCommands();
		for (const guild of (await client.guilds.fetch()).values()) {
			if (guild) {
				await getGuild(guild.id);
				await linkSlashCommands(await guild.fetch());
			}
		}

		console.log(`Client is ready, running version: ${getVersion()}`);
	},
};

export default ready;
