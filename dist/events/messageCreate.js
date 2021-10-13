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
const messageCreate = {
    name: "messageCreate",
    once: false,
    callback: (message) => __awaiter(void 0, void 0, void 0, function* () {
        if (message.author.bot == false) {
            const user = yield (0, globals_1.getUser)(message.author.id);
            if (!user)
                return;
            if (message.content.startsWith(user.prefix)) {
                const commands = yield (0, globals_1.getCommands)();
                const content = message.content.split(user.prefix)[1];
                const args = content.split(" ");
                let request = args.shift();
                if (request) {
                    request = request.toLowerCase();
                }
                const query = commands.find(command => command.name.toLowerCase() == request);
                if (query && query.message && message.member) {
                    const hasPermissions = query.permissions ? message.member.permissions.has(query.permissions) : true;
                    if (hasPermissions) {
                        query.message.callback(message, args);
                    }
                }
            }
        }
    }),
};
exports.default = messageCreate;
