import type { Snowflake } from "discord-api-types";
import { Document, model, Schema } from "mongoose";
import { client } from "..";
import type { Suggestion } from "./suggestion";
export interface guildData {
	id: Snowflake;
	settings: {
		suggestions: {
			upload: {
				default: {
					id: Snowflake;
				};
				popular: {
					id: Snowflake;
					threshold: number;
					poll: boolean;
				};
			};
		};
	};
	suggestions: Suggestion[];
}

export interface guildCacheData {
	document: Document<guildData>;
	cache: guildData;
}

export const guildCache: guildCacheData[] = [];

export const IGuildSchema = new Schema<guildData>({
	id: { type: String, required: true },
	settings: {
		suggestions: {
			upload: {
				default: {
					id: { type: String, default: "" },
				},
				popular: {
					id: { type: String, default: "" },
					threshold: { type: Number, default: 10 },
					poll: { type: Boolean, default: true },
				},
			},
		},
	},
	suggestions: {
		type: [
			{
				id: { type: String, required: true },
				messageId: { type: String, default: "" },
				channelId: { type: String, default: "" },
				threadId: { type: String, default: "" },
				status: { type: String, default: "open" },
				author: {
					id: { type: String, default: "" },
					time: { type: String, default: "" },
				},
				content: { type: String, default: "" },
				comment: { type: String, default: "" },
			},
		],
		default: [],
	},
});

export const IGuild = model<guildData>("Guild", IGuildSchema);

export async function uploadGuild(guildId: Snowflake): Promise<{ document: Document<guildData>; cache: guildData }> {
	const document = await IGuild.where({ id: guildId })
		.findOne()
		.then(async guild => {
			if (guild) {
				return guild;
			} else {
				const upload = new IGuild({
					id: guildId,
				});

				await upload.save();
				return upload;
			}
		});

	const index = guildCache.push({
		document: document,
		cache: {
			id: document.id,
			settings: document.settings,
			suggestions: document.suggestions,
		},
	});

	return guildCache[index - 1];
}
export async function getGuild(guildId: Snowflake): Promise<{ document: Document<guildData>; cache: guildData }> {
	const search = guildCache.find(guild => guild.cache.id == guildId);

	if (search) {
		return search;
	} else {
		return await uploadGuild(guildId);
	}
}
export async function uploadSuggestion(guildId: Snowflake, suggestion: Suggestion): Promise<void> {
	await IGuild.updateOne(
		{ id: guildId },
		{
			$push: { suggestions: suggestion },
		}
	);

	const guild = await getGuild(guildId);
	guild.cache.suggestions.push(suggestion);
}
export async function updateSuggestion(guildId: Snowflake, suggestion: Suggestion): Promise<void> {
	await IGuild.updateOne(
		{
			id: guildId,
			"suggestions.id": suggestion.id,
		},
		{
			$set: { "suggestions.$": suggestion },
		}
	);

	const guild = await getGuild(guildId);
	guild.cache.suggestions[guild.cache.suggestions.findIndex(cache => cache.id == suggestion.id)] = suggestion;
}
export async function updateSettings(guildId: Snowflake, settings: guildData["settings"]): Promise<void> {
	await IGuild.updateOne(
		{ id: guildId },
		{
			$set: { settings: settings },
		}
	);

	const guild = await getGuild(guildId);
	guild.cache.settings = settings;
}

export async function deleteGuilds(): Promise<void> {
	await IGuild.deleteMany({});
	guildCache.splice(0, guildCache.length);
	for (const guild of (await client.guilds.fetch()).values()) {
		await getGuild(guild.id);
	}
}
