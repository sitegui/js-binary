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
exports.Schema = exports.CoderType = void 0;
const coders = __importStar(require("./coders"));
const Field_1 = require("./Field");
const MutableBuffer_1 = require("./MutableBuffer");
const ReadState_1 = require("./ReadState");
var CoderType;
(function (CoderType) {
    CoderType["UINT"] = "uint";
    CoderType["INT"] = "int";
    CoderType["FLOAT_32"] = "float32";
    CoderType["FLOAT_64"] = "float64";
    CoderType["STRING"] = "string";
    CoderType["BUFFER"] = "Buffer";
    CoderType["BOOLEAN"] = "boolean";
    CoderType["JSON"] = "json";
    CoderType["OID"] = "oid";
    CoderType["REGEX"] = "regex";
    CoderType["DATE"] = "date";
    CoderType["ARRAY"] = "[array]";
    CoderType["OBJECT"] = "{object}";
})(CoderType = exports.CoderType || (exports.CoderType = {}));
/**
 * Create a Schema, given a definition.
 */
class Schema {
    constructor(type) {
        if (Array.isArray(type)) {
            if (type.length !== 1) {
                throw new TypeError('Invalid array type, it must have exactly one element');
            }
            this.type = CoderType.ARRAY;
            this.subSchema = new Schema(type[0]);
        }
        else if (typeof type === 'object') {
            this.type = CoderType.OBJECT;
            this.fields = Object.keys(type).map(function (name) {
                return new Field_1.Field(name, type[name]);
            });
        }
        else if (type !== undefined) {
            this.type = type;
        }
        else {
            throw new Error("Invalid type given. Must be array containing a single type, an object, or a known coder type.");
        }
    }
    /**
     * @param {*} value
     * @return {Buffer}
     * @throws if the value is invalid
     */
    encode(value) {
        var data = new MutableBuffer_1.MutableBuffer();
        this.write(value, data, '');
        return data.toBuffer();
    }
    /**
     * @param {Buffer} buffer
     * @return {*}
     * @throws if fails
     */
    decode(buffer) {
        return this.read(new ReadState_1.ReadState(buffer));
    }
    /**
     * @param {*} value
     * @param {MutableBuffer} data
     * @param {string} path
     * @throws if the value is invalid
     */
    write(value, data, path) {
        var i, field, subpath, subValue, len;
        if (this.type === CoderType.ARRAY) {
            // Array field
            return this._writeArray(value, data, path, this.subSchema);
        }
        else if (this.type !== CoderType.OBJECT) {
            // Simple type
            return coders.getCoder(this.type).write(value, data, path);
        }
        // Check for object type
        if (!value || typeof value !== 'object') {
            throw new TypeError('Expected an object at ' + path);
        }
        // Write each field
        for (i = 0, len = this.fields.length; i < len; i++) {
            field = this.fields[i];
            subpath = path ? path + '.' + field.name : field.name;
            subValue = value[field.name];
            if (field.isOptional) {
                // Add 'presence' flag
                if (subValue === undefined || subValue === null) {
                    coders.booleanCoder.write(false, data);
                    continue;
                }
                else {
                    coders.booleanCoder.write(true, data);
                }
            }
            if (!field.isArray) {
                // Scalar field
                field.type.write(subValue, data, subpath);
                continue;
            }
            // Array field
            this._writeArray(subValue, data, subpath, field.type);
        }
    }
    /**
     * @param {*} value
     * @param {MutableBuffer} data
     * @param {string} path
     * @param {Schema} type
     * @throws if the value is invalid
     * @private
     */
    _writeArray(value, data, path, type) {
        var i, len;
        if (!Array.isArray(value)) {
            throw new TypeError('Expected an Array at ' + path);
        }
        len = value.length;
        coders.uintCoder.write(len, data);
        for (i = 0; i < len; i++) {
            type.write(value[i], data, path + '.' + i);
        }
    }
    /**
     * This funciton will be executed only the first time
     * After that, we'll compile the read routine and add it directly to the instance
     * @param {ReadState} state
     * @return {*}
     * @throws if fails
     */
    read(state) {
        this.read = this._compileRead();
        return this.read(state);
    }
    /**
     * Return a signature for this type. Two types that resolve to the same hash can be said as equivalents
     * @return {Buffer}
     */
    getHash() {
        var hash = new MutableBuffer_1.MutableBuffer;
        hashType(this, false, false);
        return hash.toBuffer();
        /**
         * @param {Schema} type
         * @param {boolean} array
         * @param {boolean} optional
         */
        function hashType(type, array, isOptional) {
            // Write type (first char + flags)
            // AOxx xxxx
            hash.writeUInt8((this.type.charCodeAt(0) & 0x3f) | (array ? 0x80 : 0) | (isOptional ? 0x40 : 0));
            if (this.type === CoderType.ARRAY) {
                hashType(type.subSchema, false, false);
            }
            else if (this.type === CoderType.OBJECT) {
                coders.uintCoder.write(type.fields.length, hash);
                type.fields.forEach((f) => hashType(f.type, f.isArray, f.isOptional));
            }
        }
    }
    _readOptional(state) {
        return coders.booleanCoder.read(state);
    }
    /**
     * Compile the decode method for this object
     * @return {function(ReadState):*}
     * @private
     */
    _compileRead() {
        if (this.type !== CoderType.OBJECT && this.type !== CoderType.ARRAY) {
            // Scalar type
            // In this case, there is no need to write custom code
            return coders.getCoder(this.type).read;
        }
        else if (this.type === CoderType.ARRAY) {
            return this._readArray.bind(this, this.subSchema);
        }
        // As an example, compiling code to new Type({a:'int', 'b?':['string']}) will result in:
        // return {
        //     a: this.fields[0].type.read(state),
        //     b: this._readOptional(state) ? this._readArray(state, this.fields[1].type) : undefined
        // }
        var code = 'return {' + this.fields.map(function (field, i) {
            var name = JSON.stringify(field.name), fieldStr = 'this.fields[' + i + ']', readCode, code;
            if (field.isArray) {
                readCode = 'this._readArray(' + fieldStr + '.type, state)';
            }
            else {
                readCode = fieldStr + '.type.read(state)';
            }
            if (!field.isOptional) {
                code = name + ': ' + readCode;
            }
            else {
                code = name + ': this._readOptional(state) ? ' + readCode + ' : undefined';
            }
            return code;
        }).join(',') + '}';
        return new Function('state', code);
    }
    /**
     * @param {Schema} type
     * @param {ReadState} state
     * @return {Array}
     * @throws - if invalid
     * @private
     */
    _readArray(type, state) {
        var arr = new Array(coders.uintCoder.read(state)), j;
        for (j = 0; j < arr.length; j++) {
            arr[j] = type.read(state);
        }
        return arr;
    }
}
exports.Schema = Schema;
exports.default = Schema;
//# sourceMappingURL=Schema.js.map