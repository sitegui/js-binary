/**
 * A mutable-length write-only Buffer.
 */
export class MutableBuffer {
	/** Internal buffer */
	private _buffer: Buffer;

	/**  Number of used bytes */
	private _length: number = 0

	constructor(capacity: number = 128) {
		this._buffer = Buffer.alloc(capacity);
	}
	
	public appendBuffer = function (data: Buffer): void {
		this._alloc(data.length)
		data.copy(this._buffer, this._length)
		this._length += data.length
	}
	
	public writeUInt8(value: number): void {
		this._alloc(1)
		this._buffer.writeUInt8(value, this._length)
		this._length++
	}

	public writeUInt16(value: number): void {
		this._alloc(2)
		this._buffer.writeUInt16BE(value, this._length)
		this._length += 2
	}

	public writeUInt32(value: number): void {
		this._alloc(4)
		this._buffer.writeUInt32BE(value, this._length)
		this._length += 4
	}

	public writeFloat(value: number): void {
		this._alloc(4)
		this._buffer.writeFloatBE(value, this._length)
		this._length += 4
	}

	public writeDouble(value: number): void {
		this._alloc(8)
		this._buffer.writeDoubleBE(value, this._length)
		this._length += 8
	}

	/**
	 * Return the data as a Buffer.
	 *
	 * Note: The returned Buffer and the internal Buffer share the same memory
	 */
	public toBuffer(): Buffer {
		return this._buffer.slice(0, this._length)
	}

	/**
	 * Alloc the given number of bytes
	 */
	private _alloc (bytes: number): void {
		var buffLen = this._buffer.length,
			newBuffer

		if (this._length + bytes > buffLen) {
			do {
				buffLen *= 2
			} while (this._length + bytes > buffLen)

			newBuffer = Buffer.alloc(buffLen)
			this._buffer.copy(newBuffer, 0, 0, this._length)
			this._buffer = newBuffer
		}
	}
}

export default MutableBuffer;
