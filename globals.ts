import {
	ApplicationCommandData,
	ApplicationCommandPermissionData,
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

let client: Client;

export function getClient(): Client {
	if (client == null) {
		client = new Client({
			intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS],
		});
	}
	return client;
}

export async function linkDatabase(): Promise<void> {
	await connect(settings.mongoToken);
}

export function getUser(userId: Snowflake): Promise<userData | void> {
	return IUser.findOne({ id: userId })
		.then(async user => {
			if (user) {
				return user;
			} else {
				const newUser = new IUser({
					id: userId,
				});

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

export async function linkEvents(): Promise<void> {
	const eventFiles = readdirSync("./dist/events/");

	for (const event of eventFiles) {
		await import(`./events/${event}`).then(({ default: event }: { default: Event<Events> }) => {
			linkEvent<Events>(event.name, event.once, event.callback);
		});
	}
}

const commands: Command[] = [];

export async function linkCommands(): Promise<void> {
	const commandFiles = readdirSync("./dist/commands");
	for (const command of commandFiles) {
		await import(`./commands/${command}`).then(({ default: command }) => {
			commands.push(command);
		});
	}
}

export async function getCommands(): Promise<Command[]> {
	if (commands.length == 0) {
		await linkCommands();
	}
	return commands;
}

export async function linkSlashCommands(guild: Guild): Promise<void> {
	const interactions: ApplicationCommandData[] = [];
	for (const command of commands) {
		if (command.interaction && command.interaction.enabled) {
			interactions.push({
				name: command.name,
				description: command.interaction.description,
				options: command.interaction.options,
				defaultPermission: command.interaction.defaultPermission,
			});
		}
	}

	await guild.commands.set([]);
	for (const slashCommand of (await guild.commands.set(interactions)).map(command => command)) {
		const command = commands.find(command => command.name == slashCommand.name);

		if (command) {
			const permissions: ApplicationCommandPermissionData[] = [];
			if (command.interaction && command.interaction.permissions) {
				command.interaction.permissions.forEach(permission => {
					permissions.push(permission);
				});
			}

			for (const role of (await guild.roles.fetch()).map(role => role)) {
				const hasPermissions = command.permissions ? role.permissions.has(command.permissions) : false;

				if (hasPermissions) {
					permissions.push({
						id: role.id,
						type: "ROLE",
						permission: true,
					});
				}
			}

			await slashCommand.permissions.set({
				permissions: permissions,
			});
		}
	}
}
