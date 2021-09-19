import { ApplicationCommandData, ApplicationCommandPermissionData, Client, Intents } from "discord.js";
import { readdirSync } from "fs";
import { Collection, Document, MongoClient } from "mongodb";
import settings from "./settings.json";
import type { Command } from "./types/command";
import { Event, EventTypes, linkEvent } from "./types/event";
import { defaultUser } from "./types/user";

let client: Client;

export function getClient(): Client {
	if (client == null) {
		client = new Client({
			intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS],
		});
	}
	return client;
}

let database: MongoClient;

export async function getDatabase(): Promise<MongoClient> {
	if (database == null) {
		database = await new MongoClient(settings.mongoToken).connect();
	}
	return database;
}

export function getCollection(collection: string): Collection<Document> | undefined {
	if (database) {
		return database.db("data").collection(collection);
	}
}

export async function getUser(userId: string): Promise<Document | null | void> {
	let users = getCollection("users");
	if (!users) {
		users = getCollection("users");
	} else {
		let user = await users.findOne({ id: userId });
		if (!user) {
			users
				.insertOne({
					id: userId,
					prefix: defaultUser.prefix,
				})
				.catch(console.log);
			user = await users.findOne({ id: userId });
		}
		return user;
	}
}

export async function linkEvents(): Promise<void> {
	const eventFiles = readdirSync("./dist/events/");

	for (const event of eventFiles) {
		await import(`./events/${event}`)
			.then(({ default: event }: { default: Event<keyof EventTypes> }) => {
				linkEvent<keyof EventTypes>(event.name, event.once, event.callback);
			})
			.catch(console.log);
	}
}

const commands: Command[] = [];

export async function getCommands(): Promise<Command[]> {
	if (commands.length == 0) {
		const commandFiles = readdirSync("./dist/commands");
		for (const command of commandFiles) {
			await import(`./commands/${command}`)
				.then(({ default: command }) => {
					commands.push(command);
				})
				.catch(console.log);
		}
	}
	return commands;
}

export async function linkSlashCommands(): Promise<void> {
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

	for (const guild of (await client.guilds.fetch()).map(guild => client.guilds.cache.get(guild.id))) {
		if (guild) {
			await guild.commands.set([]).catch(console.log);
			for (const slashCommand of (await guild.commands.set(interactions)).map(command => command)) {
				const command = commands.find(command => command.name == slashCommand.name);

				if (command && command.interaction && command.interaction.permissions) {
					const permissions: ApplicationCommandPermissionData[] = [];

					command.interaction.permissions.forEach(permission => {
						permissions.push(permission);
					});

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

					await slashCommand.permissions
						.set({
							permissions: permissions,
						})
						.catch(console.log);
				}
			}
		}
	}
}
