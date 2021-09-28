import { getGuild, linkSlashCommands } from "../globals";
import type { Event } from "../types/event";

const guildCreate: Event<"Guild"> = {
	name: "guildCreate",
	once: false,
	callback: async guild => {
		await getGuild(guild.id);
		await linkSlashCommands(guild);
	},
};

export default guildCreate;
