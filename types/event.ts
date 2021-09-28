import type { Client, Guild, Interaction, Message, Role, ThreadChannel } from "discord.js";
import { getClient } from "../globals";

export type EventTypes = {
	Message: Message;
	Interaction: Interaction;
	Role: Role;
	Guild: Guild;
	ThreadChannel: ThreadChannel;
	Client: Client;
};
export type Event<T extends keyof EventTypes> = {
	name: string;
	once: boolean;
	callback: (...data: EventTypes[T][]) => void;
};

export function linkEvent<T extends keyof EventTypes>(
	name: string,
	once: boolean,
	callback: (...data: EventTypes[T][]) => void
): void {
	const client = getClient();

	if (once) {
		client.once(name, callback);
	} else {
		client.on(name, callback);
	}
}
