"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkEvent = void 0;
const globals_1 = require("../globals");
function linkEvent(name, once, callback) {
    const client = (0, globals_1.getClient)();
    if (once) {
        client.once(name, callback);
    }
    else {
        client.on(name, callback);
    }
}
exports.linkEvent = linkEvent;
