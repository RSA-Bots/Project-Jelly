import type { Interaction, Message } from "discord.js";
import { deploy } from "./commands/deploy";
import { ping } from "./commands/ping";
import { prefix } from "./commands/prefix";
import { unload } from "./commands/unload";
import { interactionCreate } from "./events/interactionCreate";
import { messageCreate } from "./events/messageCreate";
import { ready } from "./events/ready";
import type { Command } from "./types/command";
import type { Event } from "./types/event";

export async function GetEvents(): Promise<(Event<Interaction> | Event<Message> | Event<void>)[]> {
	const Events: (Event<Interaction> | Event<Message> | Event<void>)[] = [ready, messageCreate, interactionCreate];
	return Promise.all(Events);
}

export async function GetCommands(): Promise<Command[]> {
	const Commands: Command[] = [ping, prefix, deploy, unload];
	return Promise.all(Commands);
}
