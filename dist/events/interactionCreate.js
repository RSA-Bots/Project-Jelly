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
const globals_1 = require("../globals");
const interactionCreate = {
    name: "interactionCreate",
    once: false,
    callback: (interaction) => __awaiter(void 0, void 0, void 0, function* () {
        if (!interaction.guild ||
            !interaction.member ||
            !("permissions" in interaction.member) ||
            typeof interaction.member.permissions == "string")
            return;
        const bot = interaction.guild.me;
        if (!interaction.channel ||
            !(interaction.channel.type == "GUILD_TEXT" ||
                interaction.channel.type == "GUILD_PRIVATE_THREAD" ||
                interaction.channel.type == "GUILD_PUBLIC_THREAD") ||
            !bot ||
            !bot.permissionsIn(interaction.channel).has("VIEW_CHANNEL") ||
            !bot.permissionsIn(interaction.channel).has("SEND_MESSAGES"))
            return;
        if (interaction.isCommand()) {
            const commands = yield (0, globals_1.getCommands)();
            const search = commands.find(command => command.name.toLowerCase() == interaction.commandName);
            if (search && search.interaction) {
                search.interaction.callback(interaction);
            }
        }
        else if (interaction.isButton()) {
            const commands = yield (0, globals_1.getCommands)();
            for (const command of commands) {
                if (command.buttons) {
                    const button = command.buttons.find(buttonObject => buttonObject.button.customId == interaction.customId);
                    if (button) {
                        if (button.permissions && interaction.member.permissions.has(button.permissions)) {
                            button.callback(interaction);
                        }
                        else if (!button.permissions) {
                            button.callback(interaction);
                        }
                        else if (button.permissions && !interaction.member.permissions.has(button.permissions)) {
                            yield interaction.reply({
                                ephemeral: true,
                                content: "You have insufficient permissions to use this button.",
                            });
                        }
                    }
                }
            }
        }
        else if (interaction.isSelectMenu()) {
            const commands = yield (0, globals_1.getCommands)();
            for (const command of commands) {
                if (command.menus) {
                    const menu = command.menus.find(menuObject => menuObject.menu.customId == interaction.customId);
                    if (menu) {
                        if (menu.permissions && interaction.member.permissions.has(menu.permissions)) {
                            menu.callback(interaction);
                        }
                        else if (!menu.permissions) {
                            menu.callback(interaction);
                        }
                        else if (menu.permissions && !interaction.member.permissions.has(menu.permissions)) {
                            yield interaction.reply({
                                ephemeral: true,
                                content: "You have insufficient permissions to use this menu.",
                            });
                        }
                    }
                }
            }
        }
    }),
};
exports.default = interactionCreate;
