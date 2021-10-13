"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const globals_1 = require("../globals");
const settings = {
    name: "settings",
    interaction: {
        description: "Change settings for a guild.",
        options: [
            {
                type: "SUB_COMMAND_GROUP",
                name: "upload",
                description: "Change the upload channel for a command.",
                options: [
                    {
                        type: "SUB_COMMAND",
                        name: "reports",
                        description: "Change the upload channel of reports.",
                        options: [
                            {
                                type: "CHANNEL",
                                name: "channel",
                                description: "The channel to upload reports to.",
                                required: true,
                            },
                        ],
                    },
                    {
                        type: "SUB_COMMAND",
                        name: "suggestions",
                        description: "Change the upload channel of suggestions.",
                        options: [
                            {
                                type: "CHANNEL",
                                name: "channel",
                                description: "The channel to upload suggestions to.",
                                required: true,
                            },
                        ],
                    },
                ],
            },
        ],
        defaultPermission: false,
        enabled: true,
        callback: (interaction) => __awaiter(void 0, void 0, void 0, function* () {
            if (!interaction.guildId)
                return;
            const guild = yield (0, globals_1.getGuild)(interaction.guildId);
            if (guild) {
                switch (interaction.options.getSubcommandGroup(false)) {
                    case "upload": {
                        switch (interaction.options.getSubcommand(false)) {
                            case "reports": {
                                const channel = interaction.options.getChannel("channel");
                                if (channel && channel.type == "GUILD_TEXT") {
                                    guild.settings.reports.upload = channel.id;
                                    yield guild.updateSettings(guild.settings);
                                    yield interaction.reply({
                                        ephemeral: true,
                                        content: `Upload channel for reports has been set to <#${channel.id}>`,
                                    });
                                }
                                break;
                            }
                            case "suggestions": {
                                const channel = interaction.options.getChannel("channel");
                                if (channel && channel.type == "GUILD_TEXT") {
                                    guild.settings.suggestions.upload = channel.id;
                                    yield guild.updateSettings(guild.settings);
                                    yield interaction.reply({
                                        ephemeral: true,
                                        content: `Upload channel for suggestions has been set to <#${channel.id}>`,
                                    });
                                }
                                break;
                            }
                        }
                        break;
                    }
                }
            }
        }),
    },
    permissions: [discord_js_1.Permissions.FLAGS.MANAGE_GUILD],
};
exports.default = settings;
