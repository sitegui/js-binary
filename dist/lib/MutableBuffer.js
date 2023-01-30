"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MutableBuffer = void 0;
/**
 * A mutable-length write-only Buffer.
 */
class MutableBuffer {
    constructor(capacity = 128) {
        /**  Number of used bytes */
        this._length = 0;
        this.appendBuffer = function (data) {
            this._alloc(data.length);
            data.copy(this._buffer, this._length);
            this._length += data.length;
        };
        this._buffer = Buffer.alloc(capacity);
    }
    writeUInt8(value) {
        this._alloc(1);
        this._buffer.writeUInt8(value, this._length);
        this._length++;
    }
    writeUInt16(value) {
        this._alloc(2);
        this._buffer.writeUInt16BE(value, this._length);
        this._length += 2;
    }
    writeUInt32(value) {
        this._alloc(4);
        this._buffer.writeUInt32BE(value, this._length);
        this._length += 4;
    }
    writeFloat(value) {
        this._alloc(4);
        this._buffer.writeFloatBE(value, this._length);
        this._length += 4;
    }
    writeDouble(value) {
        this._alloc(8);
        this._buffer.writeDoubleBE(value, this._length);
        this._length += 8;
    }
    /**
     * Return the data as a Buffer.
     *
     * Note: The returned Buffer and the internal Buffer share the same memory
     */
    toBuffer() {
        return this._buffer.slice(0, this._length);
    }
    /**
     * Alloc the given number of bytes
     */
    _alloc(bytes) {
        var buffLen = this._buffer.length, newBuffer;
        if (this._length + bytes > buffLen) {
            do {
                buffLen *= 2;
            } while (this._length + bytes > buffLen);
            newBuffer = Buffer.alloc(buffLen);
            this._buffer.copy(newBuffer, 0, 0, this._length);
            this._buffer = newBuffer;
        }
    }
}
exports.MutableBuffer = MutableBuffer;
exports.default = MutableBuffer;
//# sourceMappingURL=MutableBuffer.js.map