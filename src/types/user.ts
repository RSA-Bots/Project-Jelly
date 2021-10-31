import type { Snowflake } from "discord-api-types";
import { model, Schema } from "mongoose";
import { userCache } from "../globals";

export interface userData {
	id: Snowflake;
	prefix: string;
	lastMessage: {
		time: string;
		content: string;
	};
	messageCount: number;
	commandCount: number;
	updateLastMessage(message: { time: string; content: string }): Promise<void>;
	updateMessageCount(number: number): Promise<void>;
	updateCommandCount(number: number): Promise<void>;
}

const IUserSchema = new Schema<userData>({
	id: { type: String, required: true },
	prefix: { type: String, default: "!" },
	lastMessage: {
		time: { type: String, default: "" },
		content: { type: String, default: "" },
	},
	messageCount: { type: Number, default: 0 },
	commandCount: { type: Number, default: 0 },
});

IUserSchema.method({
	updateLastMessage: async function (this: userData, message: { time: string; content: string }): Promise<void> {
		const userInfo = userCache.find(user => user.id == this.id);
		if (!userInfo) return;

		userInfo.lastMessage = message;

		await IUser.updateOne(
			{ id: this.id },
			{
				$set: { lastMessage: message },
			}
		);
	},
	updateMessageCount: async function (this: userData, number: number): Promise<void> {
		const userInfo = userCache.find(user => user.id == this.id);
		if (!userInfo) return;

		userInfo.messageCount = number;

		await IUser.updateOne(
			{ id: this.id },
			{
				$set: { messageCount: number },
			}
		);
	},
	updateCommandCount: async function (this: userData, number: number): Promise<void> {
		const userInfo = userCache.find(user => user.id == this.id);
		if (!userInfo) return;

		userInfo.commandCount = number;

		await IUser.updateOne(
			{ id: this.id },
			{
				$set: { commandCount: number },
			}
		);
	},
});

export const IUser = model<userData>("User", IUserSchema);
