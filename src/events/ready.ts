import type { Client } from "discord.js";
import { getVersion, getGuild, linkSlashCommands } from "../globals";
import { Event } from "../types/event";

const ready = new Event<Client>("ready", true, async (client: Client) => {
	for (const guild of (await client.guilds.fetch()).values()) {
		if (guild) {
			await getGuild(guild.id);
			await linkSlashCommands(await guild.fetch());
		}
	}

	console.log(`Client is ready, running version: ${getVersion()}`);
});

export default ready;
