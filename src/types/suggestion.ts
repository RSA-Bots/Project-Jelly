import type { Snowflake } from "discord-api-types";

export type Suggestion = {
	id: string;
	messageId: Snowflake;
	channelId: Snowflake;
	threadId: Snowflake;
	status: string;
	author: {
		id: Snowflake;
		time: string;
	};
	content: string;
	comment: string;
	isPopular: boolean;
};
