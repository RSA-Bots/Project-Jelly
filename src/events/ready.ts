import { Client, TextChannel } from "discord.js";
import { linkSlashCommands } from "../types/command";
import { Event } from "../types/event";
import { getGuild } from "../types/guild";
import { getUser, IUser } from "../types/user";
import { client } from "..";

new Event<Client>("ready", true, async client => {
	for (const guild of (await client.guilds.fetch()).values()) {
		guild.fetch().then(async guild => {
			await linkSlashCommands(guild);
		});

		getGuild(guild.id).then(async guild => {
			for (const suggestion of guild.cache.suggestions) {
				const channel = await client.channels.fetch(suggestion.channelId);
				if (!(channel instanceof TextChannel)) continue;

				await channel.messages.fetch(suggestion.messageId);
			}
		});
	}

	for (const user of await IUser.find({})) {
		await getUser(user.id);
	}

	console.log(`Client is ready, running version: ${process.env.npm_package_version}`);
});
