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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const report_1 = __importDefault(require("../commands/report"));
const globals_1 = require("../globals");
const ready = {
    name: "threadUpdate",
    once: false,
    callback: (oldThread, newThread) => __awaiter(void 0, void 0, void 0, function* () {
        const guild = yield (0, globals_1.getGuild)(newThread.guildId);
        if (!guild)
            return;
        const guildInfo = globals_1.guildCache.find(guild => guild.id == newThread.guildId);
        if (!guildInfo)
            return;
        const channel = newThread.parent;
        if (!channel || channel.type != "GUILD_TEXT")
            return;
        const cachedReport = guildInfo.reports.find(report => report.threadId == newThread.id);
        if (cachedReport && oldThread.archived == true && newThread.archived == false) {
            const message = yield channel.messages.fetch(cachedReport.messageId);
            const embed = message.embeds[0];
            const statusField = embed.fields.find(field => field.name == "Status");
            if (!statusField)
                return;
            statusField.value = "Open";
            const row = new discord_js_1.MessageActionRow();
            if (report_1.default.buttons) {
                for (const button of report_1.default.buttons.map(data => data.button)) {
                    if (button.customId == "closeReport") {
                        row.addComponents(button);
                    }
                }
            }
            yield message.edit({
                embeds: [embed],
                components: [row],
            });
            cachedReport.closed = {
                id: "",
                time: "",
            };
            cachedReport.status = "open";
            yield guild.updateReport(cachedReport);
        }
    }),
};
exports.default = ready;
