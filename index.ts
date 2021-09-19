import { getClient, getCommands, getDatabase, linkEvents, linkSlashCommands } from "./globals";
import settings from "./settings.json";

const hook = async () => {
	const client = getClient();

	await getDatabase()
		.then(() => console.log("Database connection has been established."))
		.catch(console.log);
	await linkEvents()
		.then(() => console.log("Client events have been imported and linked."))
		.catch(console.log);

	client
		.login(settings.botToken)
		.then(async () => {
			await getCommands()
				.then(() => console.log("Commands have been imported and initialized."))
				.catch(console.log);
			await linkSlashCommands()
				.then(() => console.log("Slash commands have been loaded onto all guilds."))
				.catch(console.log);
		})
		.catch(console.log);
};

hook().catch(console.log);
