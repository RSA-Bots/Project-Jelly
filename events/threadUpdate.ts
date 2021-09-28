import type { EmbedField, ThreadChannel } from "discord.js";
import type { Document } from "mongoose";
import { getGuild, guildCache } from "../globals";
import type { Event } from "../types/event";
import { guildData, IGuild } from "../types/guild";

const ready: Event<"ThreadChannel"> = {
	name: "threadUpdate",
	once: false,
	callback: async (oldThread: ThreadChannel, newThread: ThreadChannel) => {
		(await getGuild(newThread.guildId)) as Document<guildData> & guildData;
		const guildInfo = guildCache.find(guild => guild.id == newThread.guildId) as Document<guildData> & guildData;
		const cachedTicket = guildInfo.tickets.find(ticket => ticket.threadId == newThread.id);

		if (cachedTicket && oldThread.archived == true && newThread.archived == false) {
			const embedMessage = await newThread.messages.fetch(cachedTicket.messageId);
			const embed = embedMessage.embeds[0];
			const statusField = embed.fields.find(field => field.name == "Status") as EmbedField;
			statusField.value = "Open";

			await embedMessage.edit({
				embeds: [embed],
			});

			await IGuild.updateOne(
				{ id: newThread.guildId, "tickets.threadId": newThread.id },
				{
					$set: {
						"tickets.$.status": "open",
						"tickets.$.closedBy": {
							id: "",
							time: "",
						},
					},
				}
			);
		}
	},
};

export default ready;
