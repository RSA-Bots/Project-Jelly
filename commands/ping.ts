import {
	ButtonInteraction,
	MessageActionRow,
	MessageButton,
	MessageSelectMenu,
	SelectMenuInteraction,
} from "discord.js";
import type { Command } from "../types/command";

const ping: Command = {
	name: "ping",
	interaction: {
		description: "Sends back ping.",
		options: [],
		permissions: [],
		defaultPermission: false,
		enabled: true,
		callback: async interaction => {
			if (ping.buttons && ping.menus) {
				const buttons: MessageButton[] = [];
				ping.buttons.forEach(button => {
					buttons.push(button.object);
				});

				const menus: MessageSelectMenu[] = [];
				ping.menus.forEach(menu => {
					menus.push(menu.object);
				});

				const selectionRow = new MessageActionRow().addComponents(menus);
				const buttonRow = new MessageActionRow().addComponents(buttons);

				await interaction
					.reply({
						content: `Pinged by user id: \`\`${interaction.user.id}\`\``,
						components: [selectionRow, buttonRow],
					})
					.catch(console.log);
			}
		},
	},
	message: {
		enabled: true,
		callback: async (message, args) => {
			await message.reply(`Pinged by user id: \`\`${message.member?.id as string}\`\``).catch(console.log);
		},
	},
	buttons: [
		{
			object: new MessageButton().setCustomId("Test").setLabel("Primary").setStyle("PRIMARY"),
			callback: async (interaction: ButtonInteraction): Promise<void> => {
				await interaction.update({ content: "You clicked my button!" });
			},
		},
	],
	menus: [
		{
			object: new MessageSelectMenu()
				.setCustomId("Test")
				.setPlaceholder("Select your choice.")
				.addOptions([
					{
						label: "Test selection",
						description: "This is a test selection.",
						value: "1",
					},
				]),
			callback: async (interaction: SelectMenuInteraction): Promise<void> => {
				await interaction.update({ content: `You selected ${interaction.values[0]}` });
			},
		},
	],
	permissions: [],
};

export default ping;
