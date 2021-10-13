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
const roleCreate = {
    name: "roleCreate",
    once: false,
    callback: (role) => __awaiter(void 0, void 0, void 0, function* () {
        if (role) {
            const guild = role.guild;
            const commands = yield (0, globals_1.getCommands)();
            for (const slashCommand of (yield guild.commands.fetch()).map(command => command)) {
                const command = commands.find(command => slashCommand.name == command.name);
                if (command && command.permissions) {
                    let hasAllPermissions = true;
                    for (const permission of command.permissions) {
                        if (!role.permissions.has(permission)) {
                            hasAllPermissions = false;
                        }
                    }
                    if (hasAllPermissions) {
                        void slashCommand.permissions
                            .add({
                            permissions: [
                                {
                                    id: role.id,
                                    type: "ROLE",
                                    permission: true,
                                },
                            ],
                        })
                            .catch(console.log);
                    }
                }
            }
        }
    }),
};
exports.default = roleCreate;
