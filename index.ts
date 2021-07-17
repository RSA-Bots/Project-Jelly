/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client } from "discord.js";
import { Collection, MongoClient } from "mongodb";
import { GetEvents } from "./globals";
import Settings from "./settings.json";
import type { Event } from "./types/event";

const Hook = async () => {
	const Bot = new Client();
	const Mongo = new MongoClient(Settings.MONGO_TOKEN);

	const Connection = await Mongo.connect();
	const UserData = Connection.db("data").collection("users");

	const Events: Event<any>[] = await GetEvents();
	Events.forEach(function (Event: Event<any>) {
		Bot.on(Event.Name, function (...Args: [Client, Collection, any]) {
			Args.unshift(Bot, UserData);
			void Event.Execute.apply(null, Args);
		});
	});

	void Bot.login(Settings.BOT_TOKEN);
};

void Hook();
