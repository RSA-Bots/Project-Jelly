import type { Snowflake } from "discord-api-types";
import type { User } from "discord.js";
import { Document, model, Schema } from "mongoose";
export interface userData {
	id: Snowflake;
	username: string;
	prefix: string;
	analytics: {
		approvedSuggestions: number;
		deniedSuggestions: number;
		createdSuggestions: number;
		popularSuggestions: number;
		createdPolls: number;
	};
}

export interface userCacheData {
	document: Document<userData>;
	cache: userData;
}

export const userCache: userCacheData[] = [];

const IUserSchema = new Schema<userData>({
	id: { type: String, required: true },
	username: { type: String, default: "" },
	prefix: { type: String, default: ";" },
	analytics: {
		approvedSuggestions: { type: Number, default: 0 },
		deniedSuggestions: { type: Number, default: 0 },
		createdSuggestions: { type: Number, default: 0 },
		popularSuggestions: { type: Number, default: 0 },
		createdPolls: { type: Number, default: 0 },
	},
});

export const IUser = model<userData>("User", IUserSchema);

export async function uploadUser(userId: Snowflake): Promise<{ document: Document<userData>; cache: userData }> {
	const document = await IUser.where({ id: userId })
		.findOne()
		.then(async document => {
			if (document) {
				return document;
			} else {
				const upload = new IUser({
					id: userId,
				});

				await upload.save();
				return upload;
			}
		});

	const index = userCache.push({
		document: document,
		cache: {
			id: document.id,
			username: document.username,
			prefix: document.prefix,
			analytics: document.analytics,
		},
	});

	return userCache[index - 1];
}

export async function getUser(userId: Snowflake): Promise<{ document: Document<userData>; cache: userData }> {
	const search = userCache.find(compare => compare.cache.id == userId);

	if (search) {
		return search;
	} else {
		return await uploadUser(userId);
	}
}

export async function updateUsername(userId: Snowflake, username: string): Promise<void> {
	await IUser.updateOne(
		{ id: userId },
		{
			$set: { username: username },
		}
	);

	(await getUser(userId)).cache.username = username;
}

export async function updateAnalytics(userId: Snowflake, analytics: userData["analytics"]): Promise<void> {
	await IUser.updateOne(
		{ id: userId },
		{
			$set: { analytics: analytics },
		}
	);

	(await getUser(userId)).cache.analytics = analytics;
}

export async function deleteUsers(): Promise<void> {
	await IUser.deleteMany({});
	userCache.splice(0, userCache.length);
}

export async function deleteUser(userId: Snowflake): Promise<void> {
	await IUser.deleteOne({
		id: userId,
	});

	userCache.find((compare, index) => {
		if (compare.cache.id == userId) return userCache.splice(index, 1);
	});
}
