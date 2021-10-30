import type { Snowflake } from "discord-api-types";
import { model, Schema } from "mongoose";

export interface userData {
	id: Snowflake;
	prefix: string;
}

export const IUser = model<userData>(
	"User",
	new Schema<userData>({
		id: { type: String, required: true },
		prefix: { type: String, default: "!" },
	})
);
