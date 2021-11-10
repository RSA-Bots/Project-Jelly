import type { Snowflake } from "discord-api-types";
import { Document, model, Schema } from "mongoose";
export interface userData {
	id: Snowflake;
	prefix: string;
	stats: {
		approvedSuggestions: number;
		deniedSuggestions: number;
		createdSuggestions: number;
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
	prefix: { type: String, default: ";" },
	stats: {
		approvedSuggestions: { type: Number, default: 0 },
		createdSuggestions: { type: Number, default: 0 },
		createdPolls: { type: Number, default: 0 },
	},
});

export const IUser = model<userData>("User", IUserSchema);

export async function uploadUser(userId: Snowflake): Promise<{ document: Document<userData>; cache: userData }> {
	const document = await IUser.where({ id: userId })
		.findOne()
		.then(async user => {
			if (user) {
				return user;
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
			prefix: document.prefix,
			stats: document.stats,
		},
	});

	return userCache[index - 1];
}

export async function getUser(userId: Snowflake): Promise<{ document: Document<userData>; cache: userData }> {
	const search = userCache.find(user => user.cache.id == userId);

	if (search) {
		return search;
	} else {
		return await uploadUser(userId);
	}
}
export async function updateStats(userId: Snowflake, stats: userData["stats"]): Promise<void> {
	await IUser.updateOne(
		{ id: userId },
		{
			$set: { stats: stats },
		}
	);

	const user = await getUser(userId);
	user.cache.stats = stats;
}
