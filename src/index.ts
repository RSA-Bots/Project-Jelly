import { Client, Intents } from "discord.js";
import { connect } from "mongoose";
import settings from "./settings.json";
import { linkCommands } from "./types/command";
import { linkEvents } from "./types/event";

export const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
	],
});

const hook = async () => {
	await connect(settings.mongoToken).then(() => console.log("Database connection has been established."));
	await linkEvents().then(() => console.log("Client events have been imported and linked."));
	await linkCommands().then(() => console.log("Client commands have been imported and linked."));

	await client.login(settings.botToken);
};

hook().catch(console.log);
