import type { Snowflake } from "discord-api-types";

export type Report = {
	id: string;
	messageId: Snowflake;
	channelId: Snowflake;
	threadId: Snowflake;
	status: string;
	author: {
		id: Snowflake;
		time: string;
	};
	closed: {
		id: Snowflake;
		time: string;
	};
};
