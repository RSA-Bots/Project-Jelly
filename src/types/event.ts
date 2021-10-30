import type { Client, Guild, Interaction, Message, Role, ThreadChannel } from "discord.js";
import { getClient } from "../globals";

export type Events = Message | Interaction | Role | Guild | ThreadChannel | Client;

export type Event<T extends Events> = {
	name: string;
	once: boolean;
	callback: (...data: T[]) => void;
};

export function linkEvent<T extends Events>(name: string, once: boolean, callback: (...data: T[]) => void): void {
	const client = getClient();

	if (once) {
		client.once(name, callback);
	} else {
		client.on(name, callback);
	}
}
