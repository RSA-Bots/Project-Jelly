import type { Client } from "discord.js";
import { linkSlashCommands } from "../types/command";
import { Event } from "../types/event";
import { getGuild } from "../types/guild";

new Event<Client>("ready", true, async (client: Client) => {
	for (const guild of (await client.guilds.fetch()).values()) {
		if (guild) {
			await getGuild(guild.id);
			await linkSlashCommands(await guild.fetch());
		}
	}

	console.log(`Client is ready, running version: ${process.env.npm_package_version}`);
});
