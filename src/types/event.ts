import type { Client, Guild, Interaction, Message, MessageReaction, Role, ThreadChannel, User } from "discord.js";
import { readdirSync } from "fs";
import { client } from "../index";

export type Events = Message | Interaction | Role | Guild | ThreadChannel | Client | User | MessageReaction | void;
export class Event<T extends Events = void, K extends Events = void> {
	name: string;
	once: boolean;
	callback: (...data: [T, K]) => void;

	constructor(name: string, once: boolean, callback: (...data: [T, K]) => void) {
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
