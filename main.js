const Settings = require("./settings.json");
const GlobalsModule = require("./globals.js");

const Hook = async () => {
	const Globals = await GlobalsModule.LoadAsync();

	const Discord = Globals.Discord;
	const Client = new Discord.Client();
	const Readdir = Globals.Readdir;

	let Events = await Readdir("./events/");

	if (Events && Events.length > 0) {
		Events = Events.filter(Event => !Event.search(/\w+(?=.js)/));
		let EventsCache = [];

		Events.forEach(function (Event, Index) {
			EventsCache.push(Event.split(".")[0]);
			Events[Index] = require(`./events/${Event}`);
		}, Events);

		Globals.Events = Events;

		console.log(`Loaded [${Events.length}] event(s)`);

		Events.forEach(function (Event, Index) {
			Client.on(EventsCache[Index], async (...Args) => {
				Args.unshift(Globals);
				await Events[Index].Function.apply(null, Args);
			});
		}, Events);
	}

	let Commands = await Readdir("./commands/");
	Globals.Commands = Commands;

	if (Commands && Commands.length > 0) {
		Globals.Commands = Commands.filter(command => !command.search(/\w+(?=.js)/));
		let CommandsCache = [];

		Commands.forEach(function (Command, Index) {
			CommandsCache.push(Command.split(".")[0]);
			Globals.Commands[Index] = require(`./commands/${Command}`);
		}, Commands);

		console.log(`Loaded [${Commands.length}] command(s)`);
	}

	Client.login(Settings.bot_token);
};

Hook();
