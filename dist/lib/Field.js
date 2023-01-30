"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Field = void 0;
const Schema_1 = require("./Schema");
/**
 * Parse and represent an object field. See example in Type.js
 */
class Field {
    constructor(name, type) {
        this.isOptional = false;
        if (name[name.length - 1] === '?') {
            this.isOptional = true;
            name = name.substr(0, name.length - 1);
        }
        this.name = name;
        if (Array.isArray(type)) {
            if (type.length !== 1) {
                throw new TypeError('Invalid array definition, it must have exactly one element');
            }
            type = type[0];
            this.isArray = true;
        }
        else {
            this.isArray = false;
        }
        this.type = new Schema_1.Schema(type);
    }
}
exports.Field = Field;
exports.default = Field;
//# sourceMappingURL=Field.js.map