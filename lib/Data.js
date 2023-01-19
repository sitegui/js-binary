'use strict'

/**
 * A mutable-length write-only Buffer
 * @class
 * @param {number} [capacity=128] - initial Buffer size
 */
function Data(capacity) {
	/**
	 * Internal buffer
	 * @member {Buffer}
	 * @private
	 */
	this._buffer = new Buffer(capacity || 128)

	/**
	 * Number of used bytes
	 * @member {number}
	 * @private
	 */
	this._length = 0
}

module.exports = Data

/**
 * @param {Buffer} data
 */
Data.prototype.appendBuffer = function (data) {
	this._alloc(data.length)
	data.copy(this._buffer, this._length)
	this._length += data.length
}

/**
 * @param {number} value
 */
Data.prototype.writeUInt8 = function (value) {
	this._alloc(1)
	this._buffer.writeUInt8(value, this._length)
	this._length++
}

/**
 * @param {number} value
 */
Data.prototype.writeUInt16 = function (value) {
	this._alloc(2)
	this._buffer.writeUInt16BE(value, this._length)
	this._length += 2
}

/**
 * @param {number} value
 */
Data.prototype.writeUInt32 = function (value) {
	this._alloc(4)
	this._buffer.writeUInt32BE(value, this._length)
	this._length += 4
}

/**
 * @param {number} value
 */
Data.prototype.writeDouble = function (value) {
	this._alloc(8)
	this._buffer.writeDoubleBE(value, this._length)
	this._length += 8
}

/**
 * @param {number} value
 */
Data.prototype.writeSingle = function (value) {
	this._alloc(4)
	this._buffer.writeFloatBE(value, this._length)
	this._length += 4
}

/**
 * Return the data as a Buffer.
 * Note: the returned Buffer and the internal Buffer share the same memory
 * @return {Buffer}
 */
Data.prototype.toBuffer = function () {
	return this._buffer.slice(0, this._length)
}

/**
 * Alloc the given number of bytes
 * @param {number} bytes
 * @private
 */
Data.prototype._alloc = function (bytes) {
	var buffLen = this._buffer.length,
		newBuffer

	if (this._length + bytes > buffLen) {
		do {
			buffLen *= 2
		} while (this._length + bytes > buffLen)

		newBuffer = new Buffer(buffLen)
		this._buffer.copy(newBuffer, 0, 0, this._length)
		this._buffer = newBuffer
	}
}
