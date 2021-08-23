import type {
	ApplicationCommandData,
	ApplicationCommandPermissionData,
	Client,
	CommandInteraction,
	Interaction,
	Message,
} from "discord.js";
import type { Collection } from "mongodb";
import { getCommands } from "../globals";
import type { Command } from "../types/command";

const load: Command = {
	name: "load",
	interaction: {
		description: "Load commands onto all guilds.",
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
	permissions: [],

	execute: async (bot: Client, userData?: Collection, data?: Message | Interaction) => {
		const commands = await getCommands();
		const interactions: ApplicationCommandData[] = [];
		for (const command of commands) {
			if (command.interaction.enabled) {
				interactions.push({
					name: command.name,
					description: command.interaction.description,
					options: command.interaction.options,
					defaultPermission: command.interaction.defaultPermission,
				});
			}
		}

		void bot.guilds
			.fetch()
			.then(async guilds => {
				for (const guild of guilds.map(guild => bot.guilds.cache.get(guild.id))) {
					if (guild) {
						const roles = await guild.roles.fetch();
						void guild.commands.set(interactions).then(slashCommands => {
							for (const slashCommand of slashCommands.map(command => command)) {
								const command = commands.find(command => command.name == slashCommand.name);

								if (command) {
									const permissions: ApplicationCommandPermissionData[] = [];
									command.interaction.permissions.forEach(permission => {
										permissions.push(permission);
									});

									if (command.permissions) {
										for (const role of roles.map(role => role)) {
											let hasAllPermissions = true;
											for (const permission of command.permissions) {
												if (!role.permissions.has(permission)) {
													hasAllPermissions = false;
												}
											}

											if (hasAllPermissions) {
												permissions.push({
													id: role.id,
													type: "ROLE",
													permission: true,
												});
											}
										}
									}

									void slashCommand.permissions
										.set({
											permissions: permissions,
										})
										.catch(error => console.log(error));
								}
							}
						});
					}
				}
			})
			.then(async () => {
				if (data) {
					switch (data.type) {
						case "APPLICATION_COMMAND": {
							const interaction = data as CommandInteraction;
							await interaction
								.reply({
									content: "Commands successfully loaded",
									ephemeral: true,
								})
								.catch(error => console.log(error));
							break;
						}
						default: {
							const message = data as Message;
							await message.reply({
								content: "Commands successfully loaded",
							});
						}
					}
				} else {
					console.log("Commands successfully loaded");
				}
			})
			.catch(error => console.log(error));
	},
};

export { load };
