import {
	ApplicationCommandData,
	Client,
	Guild,
	Intents,
	Snowflake,
} from "discord.js";
import { readdirSync } from "fs";
import { connect } from "mongoose";
import settings from "./settings.json";
import type { Command } from "./types/command";
import { Event, Events, linkEvent } from "./types/event";
import { guildData, IGuild } from "./types/guild";
import { IUser, userData } from "./types/user";

import { version } from "../package.json"

let client: Client;

export function getClient(): Client {
	if (client == null) {
		client = new Client({
			intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS],
		});
	}
	return client;
}

export function getVersion(): string {
	return version
}

export const userCache: userData[] = [];

export function getUser(userId: Snowflake): Promise<userData | void> {
	return IUser.findOne({ id: userId })
		.then(async user => {
			if (user) {
				userCache.push(user)
				return user;
			} else {
				const newUser = new IUser({
					id: userId,
				});

				userCache.push(newUser)
				await newUser.save();
				return newUser;
			}
		})
		.catch(console.log);
}

export const guildCache: guildData[] = [];

export function getGuild(guildId: Snowflake): Promise<guildData | void> {
	return IGuild.findOne({ id: guildId })
		.then(async guild => {
			if (guild) {
				guildCache.push(guild);
				return guild;
			} else {
				const newGuild = new IGuild({
					id: guildId,
				});

				guildCache.push(newGuild);
				await newGuild.save();
				return newGuild;
			}
		})
		.catch(console.log);
}

export async function linkDatabase(): Promise<void> {
	await connect(settings.mongoToken);
}

export async function linkCommands(): Promise<void> {
	const commandFiles = readdirSync("./dist/commands");
	for (const command of commandFiles) {
		await import(`./commands/${command}`).then(({ default: command }) => {
			commands.push(command);
		});
	}
}

export async function linkEvents(): Promise<void> {
	const eventFiles = readdirSync("./dist/events/");

	for (const event of eventFiles) {
		await import(`./events/${event}`).then(({ default: event }: { default: Event<Events> }) => {
			linkEvent<Events>(event.name, event.once, event.callback);
		});
	}
}

export const commands: Command[] = [];

export async function linkSlashCommands(guild: Guild): Promise<void> {
	await guild.commands.set([])

	for (const command of commands) {
		if (command.events.slashCommand) {
			const commandData: ApplicationCommandData = {
				name: command.name,
				options: command.events.slashCommand.options,
				description: command.events.slashCommand.description,
				defaultPermission: command.events.slashCommand.defaultPermission,
			}

			const slashCommand = await guild.commands.create(commandData)
			if (command.events.slashCommand.permissions != undefined) {
				await slashCommand.permissions.set({
					permissions: command.events.slashCommand.permissions
				})
			}
		}
	}
}
