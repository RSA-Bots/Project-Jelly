import type { ButtonInteraction, CommandInteraction, Message, Role } from "discord.js";
import { getClient } from "../globals";

export interface EventTypes {
	Message: Message;
	Interaction: CommandInteraction | ButtonInteraction;
	Role: Role;
	void: void;
}
export interface Event<T extends keyof EventTypes> {
	name: string;
	once: boolean;
	callback: (...data: EventTypes[T][]) => void;
}

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
