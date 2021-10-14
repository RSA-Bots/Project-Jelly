import type { Snowflake } from "discord-api-types";
import { model, Schema } from "mongoose";
import { guildCache } from "../globals";
import type { Suggestion } from "./suggestion";
export interface guildData {
	id: Snowflake;
	settings: {
		suggestions: {
			upload: Snowflake;
		};
		polls: {
			upload: Snowflake;
		};
		commands: { name: string; channel: Snowflake }[];
	};
	suggestions: Suggestion[];
	uploadSuggestion(suggestion: Suggestion): Promise<void>;
	updateSuggestion(suggestion: Suggestion): Promise<void>;
	updateSettings(settings: guildData["settings"]): Promise<void>;
}

const IGuildSchema = new Schema<guildData>({
	id: { type: String, required: true },
	settings: {
		suggestions: {
			upload: { type: String, default: "" },
		},
		polls: {
			upload: { type: String, default: ""},
		},
		commands: {
			type: [
				{
					name: { type: String, required: true },
					channel: { type: String, required: true },
				},
			],
			default: [],
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
			},
		],
		default: [],
	},
});

IGuildSchema.method({
	uploadSuggestion: async function (this: guildData, suggestion: Suggestion): Promise<void> {
		const guildInfo = guildCache.find(guild => guild.id == this.id);
		if (!guildInfo) return;

		guildInfo.suggestions.push(suggestion);

		await IGuild.updateOne(
			{ id: this.id },
			{
				$push: { suggestions: suggestion },
			}
		);
	},
	updateSuggestion: async function (this: guildData, suggestion: Suggestion): Promise<void> {
		const guildInfo = guildCache.find(guild => guild.id == this.id);
		if (!guildInfo) return;

		guildInfo.suggestions[
			guildInfo.suggestions.findIndex(cachedSuggestion => cachedSuggestion.id == suggestion.id)
		] = suggestion;

		await IGuild.updateOne(
			{ id: this.id, "suggestions.id": suggestion.id },
			{
				$set: { "suggestions.$": suggestion },
			}
		);
	},
	updateSettings: async function (this: guildData, settings: guildData["settings"]): Promise<void> {
		const guildInfo = guildCache.find(guild => guild.id == this.id);
		if (!guildInfo) return;

		guildInfo.settings = settings;

		await IGuild.updateOne(
			{ id: this.id },
			{
				$set: { settings: settings },
			}
		);
	},
});

export const IGuild = model<guildData>("Guild", IGuildSchema);
