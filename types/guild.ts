import type { Snowflake } from "discord-api-types";
import { model, Schema } from "mongoose";
import type { Ticket } from "./ticket";

export interface guildData {
	id: Snowflake;
	settings: {
		tickets: {
			createChannel: Snowflake;
			uploadChannel: Snowflake;
		};
	};
	tickets: Ticket[];
}

export const IGuild = model<guildData>(
	"Guild",
	new Schema<guildData>({
		id: { type: String, required: true },
		settings: {
			tickets: {
				createChannel: { type: String, default: "" },
				uploadChannel: { type: String, default: "" },
			},
		},
		tickets: {
			type: [
				{
					id: { type: String, required: true, index: true },
					messageId: { type: String, default: "" },
					channelId: { type: String, default: "" },
					threadId: { type: String, default: "" },
					status: { type: String, default: "pending" },
					createdBy: {
						id: { type: String, default: "" },
						time: { type: String, default: "" },
					},
					openedBy: {
						id: { type: String, default: "" },
						time: { type: String, default: "" },
					},
					closedBy: {
						id: { type: String, default: "" },
						time: { type: String, default: "" },
					},
				},
			],
			default: [],
			index: true,
		},
	})
);
