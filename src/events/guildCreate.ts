import type { Guild } from "discord.js";
import { getGuild, linkSlashCommands } from "../globals";
import { Event } from "../types/event";

const guildCreate = new Event<Guild>("guildCreate", false, async guild => {
	await getGuild(guild.id);
	await linkSlashCommands(guild);
});

export default guildCreate;
