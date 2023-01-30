"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadState = void 0;
/**
 * Wraps a buffer with a read head pointer.
 */
class ReadState {
    constructor(buffer) {
        this._offset = 0;
        this._buffer = buffer;
    }
    /** Used to skip bytes for reading headers. */
    incrementOffset() {
        this._offset++;
    }
    peekUInt8() {
        return this._buffer.readUInt8(this._offset);
    }
    readUInt8() {
        return this._buffer.readUInt8(this._offset++);
    }
    readUInt16() {
        var r = this._buffer.readUInt16BE(this._offset);
        this._offset += 2;
        return r;
    }
    readUInt32() {
        var r = this._buffer.readUInt32BE(this._offset);
        this._offset += 4;
        return r;
    }
    readFloat() {
        var r = this._buffer.readFloatBE(this._offset);
        this._offset += 4;
        return r;
    }
    readDouble() {
        var r = this._buffer.readDoubleBE(this._offset);
        this._offset += 8;
        return r;
    }
    readBuffer(length) {
        if (this._offset + length > this._buffer.length) {
            throw new RangeError('Trying to access beyond buffer length');
        }
        var r = this._buffer.slice(this._offset, this._offset + length);
        this._offset += length;
        return r;
    }
    hasEnded() {
        return this._offset === this._buffer.length;
    }
}
exports.ReadState = ReadState;
exports.default = ReadState;
//# sourceMappingURL=ReadState.js.map