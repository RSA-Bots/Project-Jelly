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
exports.IGuild = void 0;
const mongoose_1 = require("mongoose");
const globals_1 = require("../globals");
const IGuildSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    settings: {
        reports: {
            upload: { type: String, default: "" },
        },
        suggestions: {
            upload: { type: String, default: "" },
        },
        commands: {
            type: [
                {
                    name: { type: String, required: true },
                    channel: { type: String, required: true },
                },
            ],
            default: [],
        },
    },
    reports: {
        type: [
            {
                id: { type: String, required: true },
                messageId: { type: String, default: "" },
                channelId: { type: String, default: "" },
                threadId: { type: String, default: "" },
                status: { type: String, default: "open" },
                author: {
                    id: { type: String, default: "" },
                    time: { type: String, default: "" },
                },
                closed: {
                    id: { type: String, default: "" },
                    time: { type: String, default: "" },
                },
            },
        ],
        default: [],
    },
    suggestions: {
        type: [
            {
                id: { type: String, required: true },
                messageId: { type: String, default: "" },
                channelId: { type: String, default: "" },
                threadId: { type: String, default: "" },
                status: { type: String, default: "open" },
                author: {
                    id: { type: String, default: "" },
                    time: { type: String, default: "" },
                },
            },
        ],
        default: [],
    },
});
IGuildSchema.method({
    uploadReport: function (report) {
        return __awaiter(this, void 0, void 0, function* () {
            const guildInfo = globals_1.guildCache.find(guild => guild.id == this.id);
            if (!guildInfo)
                return;
            guildInfo.reports.push(report);
            yield exports.IGuild.updateOne({ id: this.id }, {
                $push: { reports: report },
            });
        });
    },
    updateReport: function (report) {
        return __awaiter(this, void 0, void 0, function* () {
            const guildInfo = globals_1.guildCache.find(guild => guild.id == this.id);
            if (!guildInfo)
                return;
            guildInfo.reports[guildInfo.reports.findIndex(cachedReport => cachedReport.id == report.id)] = report;
            yield exports.IGuild.updateOne({ id: this.id, "reports.id": report.id }, {
                $set: { "reports.$": report },
            });
        });
    },
    uploadSuggestion: function (suggestion) {
        return __awaiter(this, void 0, void 0, function* () {
            const guildInfo = globals_1.guildCache.find(guild => guild.id == this.id);
            if (!guildInfo)
                return;
            guildInfo.suggestions.push(suggestion);
            yield exports.IGuild.updateOne({ id: this.id }, {
                $push: { suggestions: suggestion },
            });
        });
    },
    updateSuggestion: function (suggestion) {
        return __awaiter(this, void 0, void 0, function* () {
            const guildInfo = globals_1.guildCache.find(guild => guild.id == this.id);
            if (!guildInfo)
                return;
            guildInfo.suggestions[guildInfo.suggestions.findIndex(cachedSuggestion => cachedSuggestion.id == suggestion.id)] = suggestion;
            yield exports.IGuild.updateOne({ id: this.id, "suggestions.id": suggestion.id }, {
                $set: { "suggestions.$": suggestion },
            });
        });
    },
    updateSettings: function (settings) {
        return __awaiter(this, void 0, void 0, function* () {
            const guildInfo = globals_1.guildCache.find(guild => guild.id == this.id);
            if (!guildInfo)
                return;
            guildInfo.settings = settings;
            yield exports.IGuild.updateOne({ id: this.id }, {
                $set: { settings: settings },
            });
        });
    },
});
exports.IGuild = (0, mongoose_1.model)("Guild", IGuildSchema);
