import type { Command } from "../types/command";

const ping: Command = {
	name: "ping",
	interaction: {
		description: "Sends back ping.",
		options: [],
		permissions: [],
		defaultPermission: true,
		enabled: true,
		callback: async interaction => {
			await interaction.reply(`Pinged by user id: \`\`${interaction.user.id}\`\``).catch(console.log);
		},
	},
	message: {
		enabled: true,
		callback: async (message, args) => {
			console.log(args);
			await message.reply(`Pinged by user id: \`\`${message.member?.id as string}\`\``).catch(console.log);
		},
	},
	permissions: [],
};

export default ping;
