"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IUser = void 0;
const mongoose_1 = require("mongoose");
exports.IUser = (0, mongoose_1.model)("User", new mongoose_1.Schema({
    id: { type: String, required: true },
    prefix: { type: String, default: "!" },
}));
