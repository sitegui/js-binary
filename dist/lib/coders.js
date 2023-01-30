"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCoder = exports.dateCoder = exports.regexCoder = exports.oidCoder = exports.jsonCoder = exports.booleanCoder = exports.BufferCoder = exports.stringCoder = exports.float32Coder = exports.float64Coder = exports.intCoder = exports.uintCoder = void 0;
const Schema_1 = require("./Schema");
// Stores 2^i from i=0 to i=56
const POW = (function () {
    var r = [], i, n = 1;
    for (i = 0; i <= 56; i++) {
        r.push(n);
        n *= 2;
    }
    return r;
})();
// Pre-calculated constants
const MAX_DOUBLE_INT = POW[53], MAX_UINT8 = POW[7], MAX_UINT16 = POW[14], MAX_UINT32 = POW[29], MAX_INT8 = POW[6], MAX_INT16 = POW[13], MAX_INT32 = POW[28];
/*
 * Formats (big-endian):
 * 7b	0xxx xxxx
 * 14b	10xx xxxx  xxxx xxxx
 * 29b	110x xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx
 * 61b	111x xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx
 */
exports.uintCoder = {
    write: function (u, data, path) {
        // Check the input
        if (Math.round(u) !== u || u > MAX_DOUBLE_INT || u < 0) {
            throw new TypeError('Expected unsigned integer at ' + path + ', got ' + u);
        }
        if (u < MAX_UINT8) {
            data.writeUInt8(u);
        }
        else if (u < MAX_UINT16) {
            data.writeUInt16(u + 0x8000);
        }
        else if (u < MAX_UINT32) {
            data.writeUInt32(u + 0xc0000000);
        }
        else {
            // Split in two 32b uints
            data.writeUInt32(Math.floor(u / POW[32]) + 0xe0000000);
            data.writeUInt32(u >>> 0);
        }
    },
    read: function (state) {
        var firstByte = state.peekUInt8();
        if (!(firstByte & 0x80)) {
            state.incrementOffset();
            return firstByte;
        }
        else if (!(firstByte & 0x40)) {
            return state.readUInt16() - 0x8000;
        }
        else if (!(firstByte & 0x20)) {
            return state.readUInt32() - 0xc0000000;
        }
        else {
            return (state.readUInt32() - 0xe0000000) * POW[32] + state.readUInt32();
        }
    }
};
/*
 * Same format as uint
 */
exports.intCoder = {
    write: function (i, data, path) {
        // Check the input
        if (Math.round(i) !== i || i > MAX_DOUBLE_INT || i < -MAX_DOUBLE_INT) {
            throw new TypeError('Expected signed integer at ' + path + ', got ' + i);
        }
        if (i >= -MAX_INT8 && i < MAX_INT8) {
            data.writeUInt8(i & 0x7f);
        }
        else if (i >= -MAX_INT16 && i < MAX_INT16) {
            data.writeUInt16((i & 0x3fff) + 0x8000);
        }
        else if (i >= -MAX_INT32 && i < MAX_INT32) {
            data.writeUInt32((i & 0x1fffffff) + 0xc0000000);
        }
        else {
            // Split in two 32b uints
            data.writeUInt32((Math.floor(i / POW[32]) & 0x1fffffff) + 0xe0000000);
            data.writeUInt32(i >>> 0);
        }
    },
    read: function (state) {
        var firstByte = state.peekUInt8(), i;
        if (!(firstByte & 0x80)) {
            state.incrementOffset();
            return (firstByte & 0x40) ? (firstByte | 0xffffff80) : firstByte;
        }
        else if (!(firstByte & 0x40)) {
            i = state.readUInt16() - 0x8000;
            return (i & 0x2000) ? (i | 0xffffc000) : i;
        }
        else if (!(firstByte & 0x20)) {
            i = state.readUInt32() - 0xc0000000;
            return (i & 0x10000000) ? (i | 0xe0000000) : i;
        }
        else {
            i = state.readUInt32() - 0xe0000000;
            i = (i & 0x10000000) ? (i | 0xe0000000) : i;
            return i * POW[32] + state.readUInt32();
        }
    }
};
/*
 * 64-bit double precision float
 */
exports.float64Coder = {
    write: function (f, data, path) {
        if (typeof f !== 'number') {
            throw new TypeError('Expected a number at ' + path + ', got ' + f);
        }
        data.writeDouble(f);
    },
    read: function (state) {
        return state.readDouble();
    }
};
/*
 * 32-bit single precision float
 */
exports.float32Coder = {
    write: function (f, data, path) {
        if (typeof f !== 'number') {
            throw new TypeError('Expected a number at ' + path + ', got ' + f);
        }
        data.writeFloat(f);
    },
    read: function (state) {
        return state.readFloat();
    }
};
/*
 * <uint_length> <buffer_data>
 */
exports.stringCoder = {
    write: function (s, data, path) {
        if (typeof s !== 'string') {
            throw new TypeError('Expected a string at ' + path + ', got ' + s);
        }
        exports.BufferCoder.write(Buffer.from(s), data, path);
    },
    read: function (state) {
        return exports.BufferCoder.read(state).toString();
    }
};
/*
 * <uint_length> <buffer_data>
 */
exports.BufferCoder = {
    write: function (B, data, path) {
        if (!Buffer.isBuffer(B)) {
            throw new TypeError('Expected a Buffer at ' + path + ', got ' + B);
        }
        exports.uintCoder.write(B.length, data, path);
        data.appendBuffer(B);
    },
    read: function (state) {
        var length = exports.uintCoder.read(state);
        return state.readBuffer(length);
    }
};
/*
 * either 0x00 or 0x01
 */
exports.booleanCoder = {
    write: function (b, data, path) {
        if (typeof b !== 'boolean') {
            throw new TypeError('Expected a boolean at ' + path + ', got ' + b);
        }
        data.writeUInt8(b ? 1 : 0);
    },
    read: function (state) {
        var b = state.readUInt8();
        if (b > 1) {
            throw new Error('Invalid boolean value');
        }
        return Boolean(b);
    }
};
/*
 * <uint_length> <buffer_data>
 */
exports.jsonCoder = {
    write: function (j, data, path) {
        exports.stringCoder.write(JSON.stringify(j), data, path);
    },
    read: function (state) {
        return JSON.parse(exports.stringCoder.read(state));
    }
};
/*
 * <12B_buffer_data>
 */
exports.oidCoder = {
    write: function (o, data, path) {
        var buffer = Buffer.from(String(o), 'hex');
        if (buffer.length !== 12) {
            throw new TypeError('Expected an object id (12 bytes) at ' + path + ', got ' + o);
        }
        data.appendBuffer(buffer);
    },
    read: function (state) {
        return state.readBuffer(12).toString('hex');
    }
};
/*
 * <uint_source_length> <buffer_source_data> <flags>
 * flags is a bit-mask: g=1, i=2, m=4
 */
exports.regexCoder = {
    write: function (r, data, path) {
        var g, i, m;
        if (!(r instanceof RegExp)) {
            throw new TypeError('Expected an instance of RegExp at ' + path + ', got ' + r);
        }
        exports.stringCoder.write(r.source, data, path);
        g = r.global ? 1 : 0;
        i = r.ignoreCase ? 2 : 0;
        m = r.multiline ? 4 : 0;
        data.writeUInt8(g + i + m);
    },
    read: function (state) {
        var source = exports.stringCoder.read(state), flags = state.readUInt8(), g = flags & 0x1 ? 'g' : '', i = flags & 0x2 ? 'i' : '', m = flags & 0x4 ? 'm' : '';
        return new RegExp(source, g + i + m);
    }
};
/*
 * <uint_time_ms>
 */
exports.dateCoder = {
    write: function (d, data, path) {
        if (!(d instanceof Date)) {
            throw new TypeError('Expected an instance of Date at ' + path + ', got ' + d);
        }
        else if (isNaN(d.getTime())) {
            throw new TypeError('Expected a valid Date at ' + path + ', got ' + d);
        }
        exports.uintCoder.write(d.getTime(), data, path);
    },
    read: function (state) {
        return new Date(exports.uintCoder.read(state));
    }
};
/** Helper to get the right coder */
function getCoder(type) {
    switch (type) {
        case Schema_1.CoderType.UINT: return exports.uintCoder;
        case Schema_1.CoderType.INT: return exports.intCoder;
        case Schema_1.CoderType.FLOAT_32: return exports.float32Coder;
        case Schema_1.CoderType.FLOAT_64: return exports.float64Coder;
        case Schema_1.CoderType.STRING: return exports.stringCoder;
        case Schema_1.CoderType.BUFFER: return exports.BufferCoder;
        case Schema_1.CoderType.BOOLEAN: return exports.booleanCoder;
        case Schema_1.CoderType.JSON: return exports.jsonCoder;
        case Schema_1.CoderType.OID: return exports.oidCoder;
        case Schema_1.CoderType.REGEX: return exports.regexCoder;
        case Schema_1.CoderType.DATE: return exports.dateCoder;
        case Schema_1.CoderType.ARRAY, Schema_1.CoderType.OBJECT:
            throw new Error(`No direct coder for '${type}' type`);
        default:
            throw new Error(`Unrecognized CoderType '${type}' given`);
    }
}
exports.getCoder = getCoder;
//# sourceMappingURL=coders.js.map