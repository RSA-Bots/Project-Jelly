import { getClient, getDatabase, linkEvents } from "./globals";
import settings from "./settings.json";

const hook = async () => {
	const client = getClient();

	await getDatabase().then(() => console.log("Database connection has been established."));
	await linkEvents().then(() => console.log("Client events have been imported and linked."));

	await client.login(settings.botToken);
};

hook().catch(console.log);
