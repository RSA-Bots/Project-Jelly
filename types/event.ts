import type { Client } from "discord.js";
import type { Collection } from "mongodb";

export interface Event<T> {
	Name: string;
	Config: {
		Enabled: boolean;
	};
	Execute: (...Args: [Client, Collection, T]) => void;
}
