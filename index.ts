import { Client, Intents } from "discord.js";
import { MongoClient } from "mongodb";
import { load } from "./commands/load";
import { getEvents } from "./globals";
import Settings from "./settings.json";

const Hook = async () => {
	const bot = new Client({
		intents: [
			Intents.FLAGS.GUILDS,
			Intents.FLAGS.GUILD_MESSAGES,
			Intents.FLAGS.GUILD_INTEGRATIONS,
			Intents.FLAGS.GUILD_MEMBERS,
		],
	});

	const mongo = new MongoClient(Settings.MONGO_TOKEN);

	const connection = await mongo.connect();
	const userData = connection.db("data").collection("users");

	const events = await getEvents();
	events.forEach(function (event) {
		bot.on(event.name, function (...data) {
			if (event.config.enabled) {
				void event.execute(bot, userData, ...data);
			}
		});
	});

	void bot.login(Settings.BOT_TOKEN).then(() => {
		void load.execute(bot, userData);
	});
};

void Hook();
