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
const roleDelete = {
    name: "roleDelete",
    once: false,
    callback: (role) => __awaiter(void 0, void 0, void 0, function* () {
        if (role) {
            const guild = role.guild;
            for (const slashCommand of (yield guild.commands.fetch()).map(command => command)) {
                if (yield slashCommand.permissions.has({ permissionId: role.id })) {
                    void slashCommand.permissions
                        .remove({
                        roles: role.id,
                    })
                        .catch(console.log);
                }
            }
        }
    }),
};
exports.default = roleDelete;
