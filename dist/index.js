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
const globals_1 = require("./globals");
const settings_json_1 = __importDefault(require("./settings.json"));
const hook = () => __awaiter(void 0, void 0, void 0, function* () {
    const client = (0, globals_1.getClient)();
    yield (0, globals_1.linkDatabase)().then(() => console.log("Database connection has been established."));
    yield (0, globals_1.linkEvents)().then(() => console.log("Client events have been imported and linked."));
    yield client.login(settings_json_1.default.botToken);
});
hook().catch(console.log);
