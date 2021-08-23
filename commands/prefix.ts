import type { Client, CommandInteraction, Interaction, Message } from "discord.js";
import type { Collection } from "mongodb";
import type { Command } from "../types/command";

const prefix: Command = {
	name: "prefix",
	interaction: {
		description: "Changes your prefix.",
		options: [
			{
				name: "input",
				type: "STRING",
				description: "Enter your desired prefix, up to 3 characters long",
				required: true,
			},
		],
		permissions: [],
		defaultPermission: true,
		enabled: true,
	},
	message: {
		authority: 0,
		enabled: true,
	},

	execute: async (bot: Client, userData?: Collection, data?: Message | Interaction, args?: string[]) => {
		async function setPrefix(id: string, prefix: string) {
			if (userData) {
				await userData.findOneAndUpdate(
					{ id: id },
					{
						$set: {
							prefix: prefix,
						},
					}
				);
			}
		}

		if (data) {
			switch (data.type) {
				case "APPLICATION_COMMAND": {
					const interaction = data as CommandInteraction;
					const input = interaction.options.get("input")?.value;
					if (typeof input == "string") {
						const prefix = input.substr(0, 2);
						void setPrefix(interaction.user.id, prefix);

						await interaction
							.reply({
								content: `Prefix successfully changed to \`\`${prefix}\`\``,
								ephemeral: true,
							})
							.catch(error => console.log(error));
					}

					break;
				}
				default: {
					const message = data as Message;
					if (args && args[0]) {
						const prefix = args[0].substr(0, 2);
						void setPrefix(message.author.id, prefix);

						await message.reply({
							content: `Prefix successfully changed to \`\`${prefix}\`\``,
						});
					}
				}
			}
		}
	},
};

export { prefix };
