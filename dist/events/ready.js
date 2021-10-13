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
const package_json_1 = require("../package.json");
const ready = {
    name: "ready",
    once: true,
    callback: (client) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, globals_1.linkCommands)();
        for (const guild of (yield client.guilds.fetch()).map(guild => client.guilds.cache.get(guild.id))) {
            if (guild) {
                yield (0, globals_1.getGuild)(guild.id);
                yield (0, globals_1.linkSlashCommands)(guild);
            }
        }
        console.log(`Client is ready, running version: ${package_json_1.version}`);
    }),
};
exports.default = ready;
