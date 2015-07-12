'use strict'

var types = require('./types'),
	Data, ReadState, Field

/**
 * Create a type, given the format. The format can be either:
 * * A basic type, one of:
 *     `'uint', 'int', 'float', 'string', 'Buffer', 'boolean', 'json', 'oid', 'regex', 'date'`
 * * A compound type: an object, like:
 *     `{a: 'int', b: ['int'], c: [{'d?': 'string'}]}`
 * In the example above, 'b' is a an array of integers, 'd' is an optional field
 * * An array of values of the same type:
 *     `['int']`
 * @class
 * @param {string|Object|Array} type
 */
function Type(type) {
	/**
	 * @member {Type.TYPE} Type#type
	 */
	/**
	 * Defined fields in an `OBJECT` type
	 * @member {?Array<Field>} Type#fields
	 */
	/**
	 * Elements type for an `ARRAY` type
	 * @member {?Type} Type#subType
	 */

	if (typeof type === 'string') {
		if (type in Type.TYPE && type !== Type.TYPE.ARRAY && type !== Type.TYPE.OBJECT) {
			throw new TypeError('Unknown basic type: ' + type)
		}

		this.type = type
	} else if (Array.isArray(type)) {
		if (type.length !== 1) {
			throw new TypeError('Invalid array type, it must have exactly one element')
		}

		this.type = Type.TYPE.ARRAY
		this.subType = new Type(type[0])
	} else {
		if (!type || typeof type !== 'object') {
			throw new TypeError('Invalid type: ' + type)
		}

		this.type = Type.TYPE.OBJECT
		this.fields = Object.keys(type).map(function (name) {
			return new Field(name, type[name])
		})
	}
}

module.exports = Type

Data = require('./Data')
ReadState = require('./ReadState')
Field = require('./Field')

/**
 * All possible types
 * @enum {string}
 */
Type.TYPE = {
	UINT: 'uint',
	INT: 'int',
	FLOAT: 'float',
	STRING: 'string',
	BUFFER: 'Buffer',
	BOOLEAN: 'boolean',
	JSON: 'json',
	OID: 'oid',
	REGEX: 'regex',
	DATE: 'date',
	ARRAY: '[array]',
	OBJECT: '{object}'
}

/**
 * Expose all scalar types (see types.js)
 * @property {Object<Function>}
 */
Type.types = Type.prototype.types = types

/**
 * @param {*} value
 * @return {Buffer}
 * @throws if the value is invalid
 */
Type.prototype.encode = function (value) {
	var data = new Data
	this.write(value, data, '')
	return data.toBuffer()
}

/**
 * @param {Buffer} buffer
 * @return {*}
 * @throws if fails
 */
Type.prototype.decode = function (buffer) {
	return this.read(new ReadState(buffer))
}

/**
 * @param {*} value
 * @param {Data} data
 * @param {string} path
 * @throws if the value is invalid
 */
Type.prototype.write = function (value, data, path) {
	var i, field, subpath, subValue, len

	if (this.type === Type.TYPE.ARRAY) {
		// Array field
		return this._writeArray(value, data, path, this.subType)
	} else if (this.type !== Type.TYPE.OBJECT) {
		// Simple type
		return types[this.type].write(value, data, path)
	}

	// Check for object type
	if (!value || typeof value !== 'object') {
		throw new TypeError('Expected an object at ' + path)
	}

	// Write each field
	for (i = 0, len = this.fields.length; i < len; i++) {
		field = this.fields[i]
		subpath = path ? path + '.' + field.name : field.name
		subValue = value[field.name]

		if (field.optional) {
			// Add 'presence' flag
			if (subValue === undefined || subValue === null) {
				types.boolean.write(false, data)
				continue
			} else {
				types.boolean.write(true, data)
			}
		}

		if (!field.array) {
			// Scalar field
			field.type.write(subValue, data, subpath)
			continue
		}

		// Array field
		this._writeArray(subValue, data, subpath, field.type)
	}
}

/**
 * @param {*} value
 * @param {Data} data
 * @param {string} path
 * @param {Type} type
 * @throws if the value is invalid
 * @private
 */
Type.prototype._writeArray = function (value, data, path, type) {
	var i, len
	if (!Array.isArray(value)) {
		throw new TypeError('Expected an Array at ' + path)
	}
	len = value.length
	types.uint.write(len, data)
	for (i = 0; i < len; i++) {
		type.write(value[i], data, path + '.' + i)
	}
}

/**
 * This funciton will be executed only the first time
 * After that, we'll compile the read routine and add it directly to the instance
 * @param {ReadState} state
 * @return {*}
 * @throws if fails
 */
Type.prototype.read = function (state) {
	this.read = this._compileRead()
	return this.read(state)
}

/**
 * Return a signature for this type. Two types that resolve to the same hash can be said as equivalents
 * @return {Buffer}
 */
Type.prototype.getHash = function () {
	var hash = new Data
	hashType(this, false, false)
	return hash.toBuffer()

	/**
	 * @param {Type} type
	 * @param {boolean} array
	 * @param {boolean} optional
	 */
	function hashType(type, array, optional) {
		// Write type (first char + flags)
		// AOxx xxxx
		hash.writeUInt8((type.type.charCodeAt(0) & 0x3f) | (array ? 0x80 : 0) | (optional ? 0x40 : 0))

		if (type.type === Type.TYPE.ARRAY) {
			hashType(type.subType, false, false)
		} else if (type.type === Type.TYPE.OBJECT) {
			types.uint.write(type.fields.length, hash)
			type.fields.forEach(function (field) {
				hashType(field.type, field.array, field.optional)
			})
		}
	}
}

/**
 * Compile the decode method for this object
 * @return {function(ReadState):*}
 * @private
 */
Type.prototype._compileRead = function () {
	if (this.type !== Type.TYPE.OBJECT && this.type !== Type.TYPE.ARRAY) {
		// Scalar type
		// In this case, there is no need to write custom code
		return types[this.type].read
	} else if (this.type === Type.TYPE.ARRAY) {
		return this._readArray.bind(this, this.subType)
	}

	// As an example, compiling code to new Type({a:'int', 'b?':['string']}) will result in:
	// return {
	//     a: this.fields[0].type.read(state),
	//     b: this.types.boolean.read(state) ? this._readArray(state, this.fields[1].type) : undefined
	// }
	var code = 'return {' + this.fields.map(function (field, i) {
		var name = JSON.stringify(field.name),
			fieldStr = 'this.fields[' + i + ']',
			readCode, code

		if (field.array) {
			readCode = 'this._readArray(' + fieldStr + '.type, state)'
		} else {
			readCode = fieldStr + '.type.read(state)'
		}

		if (!field.optional) {
			code = name + ': ' + readCode
		} else {
			code = name + ': this.types.boolean.read(state) ? ' + readCode + ' : undefined'
		}
		return code
	}).join(',') + '}'

	return new Function('state', code)
}

/**
 * @param {Type} type
 * @param {ReadState} state
 * @return {Array}
 * @throws - if invalid
 * @private
 */
Type.prototype._readArray = function (type, state) {
	var arr = new Array(types.uint.read(state)),
		j
	for (j = 0; j < arr.length; j++) {
		arr[j] = type.read(state)
	}
	return arr
}