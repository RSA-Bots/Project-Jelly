"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkSlashCommands = exports.getCommands = exports.linkCommands = exports.linkEvents = exports.getGuild = exports.guildCache = exports.getUser = exports.linkDatabase = exports.getClient = void 0;
const discord_js_1 = require("discord.js");
const fs_1 = require("fs");
const mongoose_1 = require("mongoose");
const settings_json_1 = __importDefault(require("./settings.json"));
const event_1 = require("./types/event");
const guild_1 = require("./types/guild");
const user_1 = require("./types/user");
let client;
function getClient() {
    if (client == null) {
        client = new discord_js_1.Client({
            intents: [discord_js_1.Intents.FLAGS.GUILDS, discord_js_1.Intents.FLAGS.GUILD_MESSAGES, discord_js_1.Intents.FLAGS.GUILD_MEMBERS],
        });
    }
    return client;
}
exports.getClient = getClient;
function linkDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, mongoose_1.connect)(settings_json_1.default.mongoToken);
    });
}
exports.linkDatabase = linkDatabase;
function getUser(userId) {
    return user_1.IUser.findOne({ id: userId })
        .then((user) => __awaiter(this, void 0, void 0, function* () {
        if (user) {
            return user;
        }
        else {
            const newUser = new user_1.IUser({
                id: userId,
            });
            yield newUser.save();
            return newUser;
        }
    }))
        .catch(console.log);
}
exports.getUser = getUser;
exports.guildCache = [];
function getGuild(guildId) {
    return guild_1.IGuild.findOne({ id: guildId })
        .then((guild) => __awaiter(this, void 0, void 0, function* () {
        if (guild) {
            exports.guildCache.push(guild);
            return guild;
        }
        else {
            const newGuild = new guild_1.IGuild({
                id: guildId,
            });
            exports.guildCache.push(newGuild);
            yield newGuild.save();
            return newGuild;
        }
    }))
        .catch(console.log);
}
exports.getGuild = getGuild;
function linkEvents() {
    return __awaiter(this, void 0, void 0, function* () {
        const eventFiles = (0, fs_1.readdirSync)("./dist/events/");
        for (const event of eventFiles) {
            yield Promise.resolve().then(() => __importStar(require(`./events/${event}`))).then(({ default: event }) => {
                (0, event_1.linkEvent)(event.name, event.once, event.callback);
            });
        }
    });
}
exports.linkEvents = linkEvents;
const commands = [];
function linkCommands() {
    return __awaiter(this, void 0, void 0, function* () {
        const commandFiles = (0, fs_1.readdirSync)("./dist/commands");
        for (const command of commandFiles) {
            yield Promise.resolve().then(() => __importStar(require(`./commands/${command}`))).then(({ default: command }) => {
                commands.push(command);
            });
        }
    });
}
exports.linkCommands = linkCommands;
function getCommands() {
    return __awaiter(this, void 0, void 0, function* () {
        if (commands.length == 0) {
            yield linkCommands();
        }
        return commands;
    });
}
exports.getCommands = getCommands;
function linkSlashCommands(guild) {
    return __awaiter(this, void 0, void 0, function* () {
        const interactions = [];
        for (const command of commands) {
            if (command.interaction && command.interaction.enabled) {
                interactions.push({
                    name: command.name,
                    description: command.interaction.description,
                    options: command.interaction.options,
                    defaultPermission: command.interaction.defaultPermission,
                });
            }
        }
        yield guild.commands.set([]);
        for (const slashCommand of (yield guild.commands.set(interactions)).map(command => command)) {
            const command = commands.find(command => command.name == slashCommand.name);
            if (command) {
                const permissions = [];
                if (command.interaction && command.interaction.permissions) {
                    command.interaction.permissions.forEach(permission => {
                        permissions.push(permission);
                    });
                }
                for (const role of (yield guild.roles.fetch()).map(role => role)) {
                    const hasPermissions = command.permissions ? role.permissions.has(command.permissions) : false;
                    if (hasPermissions) {
                        permissions.push({
                            id: role.id,
                            type: "ROLE",
                            permission: true,
                        });
                    }
                }
                yield slashCommand.permissions.set({
                    permissions: permissions,
                });
            }
        }
    });
}
exports.linkSlashCommands = linkSlashCommands;
