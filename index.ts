/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client } from "discord.js";
import { GetEvents } from "./globals";
import Settings from "./settings.json";
import type { Event } from "./types/event";

const Hook = async () => {
	const Bot = new Client();

	const Events: Event<any>[] = await GetEvents();
	Events.forEach(function (Event: Event<any>) {
		Bot.on(Event.Name, function (...Args: [Client, any]) {
			Args.unshift(Bot);
			void Event.Execute.apply(null, Args);
		});
	});

	void Bot.login(Settings.BOT_TOKEN);
};

void Hook();
