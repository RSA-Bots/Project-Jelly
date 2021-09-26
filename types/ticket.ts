import type { Snowflake } from "discord-api-types";

export type Ticket = {
	id: number | string;
	messageId?: Snowflake;
	channelId?: Snowflake;
	status: string;
	createdBy: {
		id: Snowflake;
		time: string;
	};
	acceptedBy?: {
		id: Snowflake;
		time: string;
	};
	closedBy?: {
		id: Snowflake;
		time: string;
	};
};
