import type { Snowflake } from "discord-api-types";
import type { Ticket } from "./ticket";

export type Guild = {
	id?: Snowflake;
	settings: {
		tickets: {
			createChannel: Snowflake | undefined;
			uploadChannel: Snowflake | undefined;
		};
	};
	tickets: Ticket[];
};

export const defaultGuild: Guild = {
	settings: {
		tickets: {
			createChannel: undefined,
			uploadChannel: undefined,
		},
	},
	tickets: [],
};
