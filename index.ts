/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client, Intents, Interaction, Message } from "discord.js";
import { MongoClient } from "mongodb";
import { GetEvents } from "./globals";
import Settings from "./settings.json";
import type { Event } from "./types/event";

const Hook = async () => {
	const Bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

	const Mongo = new MongoClient(Settings.MONGO_TOKEN);

	const Connection = await Mongo.connect();
	const UserData = Connection.db("data").collection("users");

	const Events: (Event<Interaction> | Event<Message> | Event<void>)[] = await GetEvents();
	Events.forEach(function (Event: Event<Interaction> | Event<Message> | Event<void>) {
		Bot.on(Event.Name, function (...Data) {
			void Event.Execute(Bot, UserData, ...Data);
		});
	});

	void Bot.login(Settings.BOT_TOKEN);
};

void Hook();
