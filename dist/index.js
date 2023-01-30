"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.coders = exports.Schema = exports.CoderType = exports.ReadState = exports.Field = exports.MutableBuffer = void 0;
var MutableBuffer_1 = require("./lib/MutableBuffer");
Object.defineProperty(exports, "MutableBuffer", { enumerable: true, get: function () { return MutableBuffer_1.MutableBuffer; } });
var Field_1 = require("./lib/Field");
Object.defineProperty(exports, "Field", { enumerable: true, get: function () { return Field_1.Field; } });
var ReadState_1 = require("./lib/ReadState");
Object.defineProperty(exports, "ReadState", { enumerable: true, get: function () { return ReadState_1.ReadState; } });
var Schema_1 = require("./lib/Schema");
Object.defineProperty(exports, "CoderType", { enumerable: true, get: function () { return Schema_1.CoderType; } });
Object.defineProperty(exports, "Schema", { enumerable: true, get: function () { return Schema_1.Schema; } });
exports.coders = __importStar(require("./lib/coders"));
//# sourceMappingURL=index.js.map