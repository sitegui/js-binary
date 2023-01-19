'use strict'

/**
 * Wraps a buffer with a read head pointer
 * @class
 * @param {Buffer} buffer
 */
function ReadState(buffer) {
	/**
	 * @member {Buffer}
	 * @private
	 */
	this._buffer = buffer
	/**
	 * @member {number}
	 * @private
	 */
	this._offset = 0
}

module.exports = ReadState

/**
 * Read one byte but don't advance the read pointer
 * @returns {number}
 */
ReadState.prototype.peekUInt8 = function () {
	return this._buffer.readUInt8(this._offset)
}

/**
 * Read one byte and advance the read pointer
 * @returns {number}
 */
ReadState.prototype.readUInt8 = function () {
	return this._buffer.readUInt8(this._offset++)
}

/**
 * @returns {number}
 */
ReadState.prototype.readUInt16 = function () {
	var r = this._buffer.readUInt16BE(this._offset)
	this._offset += 2
	return r
}

/**
 * @returns {number}
 */
ReadState.prototype.readUInt32 = function () {
	var r = this._buffer.readUInt32BE(this._offset)
	this._offset += 4
	return r
}

/**
 * @returns {number}
 */
ReadState.prototype.readDouble = function () {
	var r = this._buffer.readDoubleBE(this._offset)
	this._offset += 8
	return r
}

/**
 * @returns {number}
 */
ReadState.prototype.readSingle = function () {
	var r = this._buffer.readFloatBE(this._offset)
	this._offset += 4
	return r
}

/**
 * @param {number} length
 * @returns {Buffer}
 */
ReadState.prototype.readBuffer = function (length) {
	if (this._offset + length > this._buffer.length) {
		throw new RangeError('Trying to access beyond buffer length')
	}
	var r = this._buffer.slice(this._offset, this._offset + length)
	this._offset += length
	return r
}

/**
 * @return {boolean}
 */
ReadState.prototype.hasEnded = function () {
	return this._offset === this._buffer.length
}
