import type { Command } from "../types/command";

const ticket: Command = {
	name: "ticket",
	interaction: {
		description: "Create, edit, and manage tickets.",
		options: [],
		permissions: [],
		defaultPermission: true,
		enabled: true,
		callback: async interaction => {
			// interaction callback
		},
	},
	message: {
		enabled: true,
		callback: message => {
			// message callback
		},
	},
	permissions: [],
};

export default ticket;
