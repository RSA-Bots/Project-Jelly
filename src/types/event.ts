import type { Client, Guild, Interaction, Message, Role, ThreadChannel } from "discord.js";
import { getClient } from "../globals";

export type Events = Message | Interaction | Role | Guild | ThreadChannel | Client;

export class Event<T extends Events> {
	name: string;
	once: boolean;
	callback: (...data: T[]) => void;

	constructor(name: string, once: boolean, callback: (...data: T[]) => void) {
		(this.name = name), (this.once = once), (this.callback = callback);

		const client = getClient();
		if (once) {
			client.once(name, callback);
		} else {
			client.on(name, callback);
		}
	}
}
