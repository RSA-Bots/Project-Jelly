import type { Guild } from "discord.js";
import { linkSlashCommands } from "../types/command";
import { Event } from "../types/event";
import { getGuild } from "../types/guild";

new Event<Guild>("guildCreate", false, async guild => {
	await getGuild(guild.id);
	await linkSlashCommands(guild);
});
