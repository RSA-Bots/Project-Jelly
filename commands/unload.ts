import type { Client, CommandInteraction, Interaction, Message } from "discord.js";
import type { Collection } from "mongodb";
import type { Command } from "../types/command";

const unload: Command = {
	name: "unload",
	interaction: {
		description: "Unloads all interactions from all guilds.",
		options: [],
		permissions: [
			{
				id: "454873852254617601",
				type: "USER",
				permission: true,
			},
		],
		defaultPermission: false,
		enabled: true,
	},
	message: {
		authority: 9,
		enabled: true,
	},

	execute: async (bot: Client, userData?: Collection, data?: Message | Interaction) => {
		if (data) {
			void bot.guilds.fetch().then(guilds => {
				for (const guild of guilds.map(guild => bot.guilds.cache.get(guild.id))) {
					if (guild) {
						void guild.commands.set([]);
					}
				}
			});

			switch (data.type) {
				case "APPLICATION_COMMAND": {
					const interaction = data as CommandInteraction;
					await interaction
						.reply({
							content: "Commands successfully unloaded",
							ephemeral: true,
						})
						.catch(error => console.log(error));

					break;
				}
				default: {
					console.log("Commands successfully unloaded");
				}
			}
		}
	},
};

export { unload };
