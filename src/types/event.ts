import type { Client, Guild, Interaction, Message, Role, ThreadChannel } from "discord.js";
import { readdirSync } from "fs";
import { client } from "../index";

export type Events = Message | Interaction | Role | Guild | ThreadChannel | Client;
export class Event<T extends Events> {
	name: string;
	once: boolean;
	callback: (...data: T[]) => void;

	constructor(name: string, once: boolean, callback: (...data: T[]) => void) {
		(this.name = name), (this.once = once), (this.callback = callback);
		if (once) {
			client.once(name, callback);
		} else {
			client.on(name, callback);
		}
	}
}

export async function linkEvents(): Promise<void> {
	const eventFiles = readdirSync("./src/events");
	for (const event of eventFiles) {
		await import(`../events/${event.split(".").shift()}`);
	}
}
