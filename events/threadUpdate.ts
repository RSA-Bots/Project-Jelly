import { MessageActionRow, ThreadChannel } from "discord.js";
import report from "../commands/report";
import { getGuild, guildCache } from "../globals";
import type { Event } from "../types/event";

const ready: Event<ThreadChannel> = {
	name: "threadUpdate",
	once: false,
	callback: async (oldThread: ThreadChannel, newThread: ThreadChannel) => {
		const guild = await getGuild(newThread.guildId);
		if (!guild) return;

		const guildInfo = guildCache.find(guild => guild.id == newThread.guildId);
		if (!guildInfo) return;

		const cachedReport = guildInfo.reports.find(report => report.threadId == newThread.id);

		const channel = newThread.parent;
		if (!channel || channel.type != "GUILD_TEXT") return;

		if (cachedReport && oldThread.archived == true && newThread.archived == false) {
			const message = await channel.messages.fetch(cachedReport.messageId);
			const embed = message.embeds[0];
			const statusField = embed.fields.find(field => field.name == "Status");
			if (!statusField) return;

			statusField.value = "Open";

			const row = new MessageActionRow();
			if (report.buttons) {
				for (const button of report.buttons.map(data => data.button)) {
					if (button.customId == "closeReport") {
						row.addComponents(button);
					}
				}
			}

			await message.edit({
				embeds: [embed],
				components: [row],
			});

			cachedReport.closed = {
				id: "",
				time: "",
			};
			cachedReport.status = "open";
			await guild.updateReport(cachedReport);
		}
	},
};

export default ready;
