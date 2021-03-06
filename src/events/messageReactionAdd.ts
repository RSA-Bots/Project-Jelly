import { Message, MessageEmbed, MessageReaction, TextChannel, User } from "discord.js";
import { client } from "..";
import { Event } from "../types/event";
import { getGuild, updateSuggestion } from "../types/guild";
import { getUser, updateAnalytics } from "../types/user";

new Event<MessageReaction, User>("messageReactionAdd", false, async (reaction, user) => {
	const message = reaction.message;
	if (!(message instanceof Message) || !message.guildId || user.bot) return;

	const guild = await getGuild(message.guildId);
	const suggestion = guild.cache.suggestions.find(suggestion => suggestion.messageId == message.id);
	if (!suggestion) return;

	if (suggestion) {
		const settings = guild.cache.settings.suggestions.upload.popular;

		if (reaction.emoji.name == "👍" && reaction.count >= settings.threshold && !suggestion.isPopular) {
			const user = await getUser(suggestion.author.id);
			user.cache.analytics.popularSuggestions += 1;
			await updateAnalytics(user.cache.id, user.cache.analytics);

			if (settings.id) {
				suggestion.isPopular = true;
				await updateSuggestion(guild.cache.id, suggestion);

				const uploadChannel = await client.channels.fetch(settings.id);
				if (uploadChannel instanceof TextChannel) {
					const poll = await uploadChannel.send({
						embeds: message.embeds,
					});
					if (settings.poll) {
						await poll.react("👍"), await poll.react("👎");
					}
				}
			}
		}
	}
});
