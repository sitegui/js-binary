/**
 * Wraps a buffer with a read head pointer.
 */
export class ReadState {
	private _buffer: Buffer;
	private _offset: number = 0

	constructor (buffer: Buffer) {
		this._buffer = buffer;
	}

	/** Used to skip bytes for reading headers. */
	public incrementOffset(): void {
		this._offset++;
	}

	public peekUInt8(): number {
		return this._buffer.readUInt8(this._offset)
	}

	public readUInt8(): number {
		return this._buffer.readUInt8(this._offset++)
	}

	public readUInt16(): number {
		var r = this._buffer.readUInt16BE(this._offset)
		this._offset += 2
		return r
	}

	public readUInt32(): number {
		var r = this._buffer.readUInt32BE(this._offset)
		this._offset += 4
		return r
	}

	public readFloat(): number {
		var r = this._buffer.readFloatBE(this._offset)
		this._offset += 4
		return r
	}

	public readDouble(): number {
		var r = this._buffer.readDoubleBE(this._offset)
		this._offset += 8
		return r
	}

	public readBuffer(length: number): Buffer {
		if (this._offset + length > this._buffer.length) {
			throw new RangeError('Trying to access beyond buffer length')
		}
		var r = this._buffer.slice(this._offset, this._offset + length)
		this._offset += length
		return r
	}

	public hasEnded(): boolean {
		return this._offset === this._buffer.length
	}
}

export default ReadState;
