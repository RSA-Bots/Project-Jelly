import type { Client } from "discord.js";
import type { Collection } from "mongodb";
export interface Event<T> {
	Name: string;
	Config: {
		Enabled: boolean;
	};
	Execute: (Bot: Client, UserData: Collection, Data?: T) => void;
}
