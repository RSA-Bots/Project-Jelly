import type { Client } from "discord.js";
import type { Collection } from "mongodb";
export interface Event<T> {
	name: string;
	config: {
		enabled: boolean;
	};
	execute: (bot: Client, userData: Collection, data?: T) => void;
}
