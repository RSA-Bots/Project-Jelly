import { getClient, linkCommands, linkDatabase, linkEvents } from "./globals";
import settings from "./settings.json";

const hook = async () => {
	const client = getClient();

	await linkDatabase().then(() => console.log("Database connection has been established."));
	await linkEvents().then(() => console.log("Client events have been imported and linked."));
	await linkCommands().then(() => console.log("Client commands have been imported and linked."));

	await client.login(settings.botToken);
};

hook().catch(console.log);
