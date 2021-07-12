module.exports = {
	Events: [],
	Commands: [],
	LoadAsync: async function () {
		this.Promisify = await import("util").promisify;
		this.Discord = await import("discord.js");
		this.Fs = await import("fs");

		this.Fs = this.Fs.promises;
		this.Readdir = this.Fs.readdir;

		return this;
	},
};
