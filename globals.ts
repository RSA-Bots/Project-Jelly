/* eslint-disable @typescript-eslint/no-explicit-any */
import { ping } from "./commands/ping";
import { message } from "./events/message";
import { ready } from "./events/ready";
import type { Command } from "./types/command";
import type { Event } from "./types/event";

export function GetEvents(): Promise<Event<any>[]> {
	return Promise.all([ready, message]);
}

export async function GetCommands(): Promise<Command[]> {
	return Promise.all([ping]);
}
