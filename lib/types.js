'use strict'

// Stores 2^i from i=0 to i=56
var POW = (function () {
	var r = [],
		i, n = 1
	for (i = 0; i <= 56; i++) {
		r.push(n)
		n *= 2
	}
	return r
})()

// Pre-calculated constants
var MAX_DOUBLE_INT = POW[53],
	MAX_UINT8 = POW[7],
	MAX_UINT16 = POW[14],
	MAX_UINT32 = POW[29],
	MAX_INT8 = POW[6],
	MAX_INT16 = POW[13],
	MAX_INT32 = POW[28]

/*
 * Formats (big-endian):
 * 7b	0xxx xxxx
 * 14b	10xx xxxx  xxxx xxxx
 * 29b	110x xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx
 * 61b	111x xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx
 */
module.exports.uint = {
	write: function (u, data, path) {
		// Check the input
		if (Math.round(u) !== u || u > MAX_DOUBLE_INT || u < 0) {
			throw new TypeError('Expected unsigned integer at ' + path + ', got ' + u)
		}

		if (u < MAX_UINT8) {
			data.writeUInt8(u)
		} else if (u < MAX_UINT16) {
			data.writeUInt16(u + 0x8000)
		} else if (u < MAX_UINT32) {
			data.writeUInt32(u + 0xc0000000)
		} else {
			// Split in two 32b uints
			data.writeUInt32(Math.floor(u / POW[32]) + 0xe0000000)
			data.writeUInt32(u >>> 0)
		}
	},
	read: function (state) {
		var firstByte = state.peekUInt8()

		if (!(firstByte & 0x80)) {
			state._offset++
			return firstByte
		} else if (!(firstByte & 0x40)) {
			return state.readUInt16() - 0x8000
		} else if (!(firstByte & 0x20)) {
			return state.readUInt32() - 0xc0000000
		} else {
			return (state.readUInt32() - 0xe0000000) * POW[32] + state.readUInt32()
		}
	}
}

/*
 * Same format as uint
 */
module.exports.int = {
	write: function (i, data, path) {
		// Check the input
		if (Math.round(i) !== i || i > MAX_DOUBLE_INT || i < -MAX_DOUBLE_INT) {
			throw new TypeError('Expected signed integer at ' + path + ', got ' + i)
		}

		if (i >= -MAX_INT8 && i < MAX_INT8) {
			data.writeUInt8(i & 0x7f)
		} else if (i >= -MAX_INT16 && i < MAX_INT16) {
			data.writeUInt16((i & 0x3fff) + 0x8000)
		} else if (i >= -MAX_INT32 && i < MAX_INT32) {
			data.writeUInt32((i & 0x1fffffff) + 0xc0000000)
		} else {
			// Split in two 32b uints
			data.writeUInt32((Math.floor(i / POW[32]) & 0x1fffffff) + 0xe0000000)
			data.writeUInt32(i >>> 0)
		}
	},
	read: function (state) {
		var firstByte = state.peekUInt8(),
			i

		if (!(firstByte & 0x80)) {
			state._offset++
			return (firstByte & 0x40) ? (firstByte | 0xffffff80) : firstByte
		} else if (!(firstByte & 0x40)) {
			i = state.readUInt16() - 0x8000
			return (i & 0x2000) ? (i | 0xffffc000) : i
		} else if (!(firstByte & 0x20)) {
			i = state.readUInt32() - 0xc0000000
			return (i & 0x10000000) ? (i | 0xe0000000) : i
		} else {
			i = state.readUInt32() - 0xe0000000
			i = (i & 0x10000000) ? (i | 0xe0000000) : i
			return i * POW[32] + state.readUInt32()
		}
	}
}

/*
 * 64bit double
 */
module.exports.float = {
	write: function (f, data, path) {
		if (typeof f !== 'number') {
			throw new TypeError('Expected a number at ' + path + ', got ' + f)
		}
		data.writeDouble(f)
	},
	read: function (state) {
		return state.readDouble()
	}
}

/*
 * <uint_length> <buffer_data>
 */
module.exports.string = {
	write: function (s, data, path) {
		if (typeof s !== 'string') {
			throw new TypeError('Expected a string at ' + path + ', got ' + s)
		}

		exports.Buffer.write(new Buffer(s), data, path)
	},
	read: function (state) {
		return exports.Buffer.read(state).toString()
	}
}

/*
 * <uint_length> <buffer_data>
 */
module.exports.Buffer = {
	write: function (B, data, path) {
		if (!Buffer.isBuffer(B)) {
			throw new TypeError('Expected a Buffer at ' + path + ', got ' + B)
		}
		exports.uint.write(B.length, data, path)
		data.appendBuffer(B)
	},
	read: function (state) {
		var length = exports.uint.read(state)
		return state.readBuffer(length)
	}
}

/*
 * either 0x00 or 0x01
 */
module.exports.boolean = {
	write: function (b, data, path) {
		if (typeof b !== 'boolean') {
			throw new TypeError('Expected a boolean at ' + path + ', got ' + b)
		}
		data.writeUInt8(b ? 1 : 0)
	},
	read: function (state) {
		var b = state.readUInt8()
		if (b > 1) {
			throw new Error('Invalid boolean value')
		}
		return Boolean(b)
	}
}

/*
 * <uint_length> <buffer_data>
 */
module.exports.json = {
	write: function (j, data, path) {
		exports.string.write(JSON.stringify(j), data, path)
	},
	read: function (state) {
		return JSON.parse(exports.string.read(state))
	}
}

/*
 * <12B_buffer_data>
 */
module.exports.oid = {
	write: function (o, data, path) {
		var buffer = new Buffer(String(o), 'hex')
		if (buffer.length !== 12) {
			throw new TypeError('Expected an object id (12 bytes) at ' + path + ', got ' + o)
		}
		data.appendBuffer(buffer)
	},
	read: function (state) {
		return state.readBuffer(12).toString('hex')
	}
}

/*
 * <uint_source_length> <buffer_source_data> <flags>
 * flags is a bit-mask: g=1, i=2, m=4
 */
module.exports.regex = {
	write: function (r, data, path) {
		var g, i, m
		if (!(r instanceof RegExp)) {
			throw new TypeError('Expected an instance of RegExp at ' + path + ', got ' + r)
		}
		exports.string.write(r.source, data, path)
		g = r.global ? 1 : 0
		i = r.ignoreCase ? 2 : 0
		m = r.multiline ? 4 : 0
		data.writeUInt8(g + i + m)
	},
	read: function (state) {
		var source = exports.string.read(state),
			flags = state.readUInt8(),
			g = flags & 0x1 ? 'g' : '',
			i = flags & 0x2 ? 'i' : '',
			m = flags & 0x4 ? 'm' : ''
		return new RegExp(source, g + i + m)
	}
}

/*
 * <uint_time_ms>
 */
module.exports.date = {
	write: function (d, data, path) {
		if (!(d instanceof Date)) {
			throw new TypeError('Expected an instance of Date at ' + path + ', got ' + d)
		} else if (isNaN(d.getTime())) {
			throw new TypeError('Expected a valid Date at ' + path + ', got ' + d)
		}
		exports.uint.write(d.getTime(), data, path)
	},
	read: function (state) {
		return new Date(exports.uint.read(state))
	}
}