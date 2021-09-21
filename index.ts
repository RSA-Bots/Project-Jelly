import { getClient, getDatabase, linkEvents } from "./globals";
import settings from "./settings.json";

const hook = async () => {
	const client = getClient();

	await getDatabase()
		.then(() => console.log("Database connection has been established."))
		.catch(console.log);
	await linkEvents()
		.then(() => console.log("Client events have been imported and linked."))
		.catch(console.log);

	client.login(settings.botToken).catch(console.log);
};

hook().catch(console.log);
