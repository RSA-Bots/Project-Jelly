import type { Client } from "discord.js";

export interface Event<T> {
	Name: string;
	Config: {
		Enabled: boolean;
	};
	Execute: (...Args: [Client, T]) => void;
}
