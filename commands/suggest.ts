import type { Command } from "../types/command";

const suggest: Command = {
	name: "suggest",
	interaction: {
		description: "Suggest an idea that you have.",
		defaultPermission: true,
		enabled: true,
		callback: interaction => {
			//
		},
	},
};

export default suggest;
