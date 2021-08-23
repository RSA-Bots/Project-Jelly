import type { Interaction, Message, Role } from "discord.js";
import { load } from "./commands/load";
import { ping } from "./commands/ping";
import { prefix } from "./commands/prefix";
import { unload } from "./commands/unload";
import { interactionCreate } from "./events/interactionCreate";
import { messageCreate } from "./events/messageCreate";
import { ready } from "./events/ready";
import { roleCreate } from "./events/roleCreate";
import { roleDelete } from "./events/roleDelete";
import { roleUpdate } from "./events/roleUpdate";
import type { Command } from "./types/command";
import type { Event } from "./types/event";

export async function getEvents(): Promise<(Event<Interaction> | Event<Message> | Event<Role> | Event<void>)[]> {
	const events = [ready, messageCreate, interactionCreate, roleUpdate, roleCreate, roleDelete];
	return Promise.all(events);
}

export async function getCommands(): Promise<Command[]> {
	const commands: Command[] = [ping, prefix, load, unload];
	return Promise.all(commands);
}
