import type { Snowflake } from "discord-api-types";

export type Ticket = {
	id: string;
	messageId: Snowflake;
	channelId: Snowflake;
	threadId: Snowflake;
	status: string;
	createdBy: {
		id: Snowflake;
		time: string;
	};
	openedBy: {
		id: Snowflake;
		time: string;
	};
	closedBy: {
		id: Snowflake;
		time: string;
	};
};
