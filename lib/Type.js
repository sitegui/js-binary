'use strict'

var types = require('./types'),
	Data, ReadState, Field

/**
 * Create a type, given the format. The format can be either:
 * * A basic type, one of:
 *
 *     'uint', 'int', 'float', 'string', 'Buffer', 'boolean', 'json', 'oid', 'regex', 'date'
 * * A compound type: an object, like:
 *
 *     {a: 'int', b: ['int'], c: [{'d?': 'string'}]}
 * In the example above, 'b' is a an array of integers, 'd' is an optional field
 * @class
 * @param {string|Object} type
 */
function Type(type) {
	if (typeof type === 'string') {
		if (Type.basicTypes.indexOf(type) === -1) {
			throw new TypeError('Unknown basic type: ' + type)
		}

		/** @member {string} */
		this.type = type
		return
	}

	if (!type || typeof type !== 'object') {
		throw new TypeError('Invalid type: ' + type)
	}

	this.type = Type.OBJECT

	/** @member {Array<Field>} */
	this.fields = Object.keys(type).map(function (name) {
		return new Field(name, type[name])
	})
}

module.exports = Type

Data = require('./Data')
ReadState = require('./ReadState')
Field = require('./Field')

Type.UINT = 'uint'
Type.INT = 'int'
Type.FLOAT = 'float'
Type.STRING = 'string'
Type.BUFFER = 'Buffer'
Type.BOOLEAN = 'boolean'
Type.JSON = 'json'
Type.OID = 'oid'
Type.REGEX = 'regex'
Type.DATE = 'date'
Type.OBJECT = '{object}'
Type.basicTypes = [
	Type.UINT,
	Type.INT,
	Type.FLOAT,
	Type.STRING,
	Type.BUFFER,
	Type.BOOLEAN,
	Type.JSON,
	Type.OID,
	Type.REGEX,
	Type.DATE
]

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
 * @throws - if fails
 */
Type.prototype.decode = function (buffer) {
	return this.read(new ReadState(buffer))
}

/**
 * @param {*} value
 * @param {Data} data
 * @param {string} [path=''	] - used internally
 * @throws if the value is invalid
 */
Type.prototype.write = function (value, data, path) {
	var i, field, subpath, subValue, len, arrLen, j

	path = path || ''

	if (this.type !== Type.OBJECT) {
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
		if (!Array.isArray(subValue)) {
			throw new TypeError('Expected an Array at ' + subpath)
		}
		arrLen = subValue.length
		types.uint.write(arrLen, data)
		for (j = 0; j < arrLen; j++) {
			field.type.write(subValue[j], data, subpath + '.' + j)
		}
	}
}

/**
 * @param {ReadState} state
 * @return {*}
 * @throws - if fails
 */
Type.prototype.read = function (state) {
	// This funciton will be executed only the first time
	// After that, we'll compile the read routine and add it directly to the instance
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

		if (type.type !== Type.OBJECT) {
			// Basic type: done
			return
		}

		types.uint.write(type.fields.length, hash)
		type.fields.forEach(function (field) {
			hashType(field.type, field.array, field.optional)
		})
	}
}

/**
 * Compile the decode method for this object
 * @return {Function}
 */
Type.prototype._compileRead = function () {
	if (this.type !== Type.OBJECT) {
		// Scalar type
		// In this case, there is no need to write custom code
		return types[this.type].read
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
			readCode = 'this._readArray(state, ' + fieldStr + '.type)'
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
 * @param {ReadState} state
 * @param {Type} type
 * @return {Array}
 * @throws - if invalid
 * @private
 */
Type.prototype._readArray = function (state, type) {
	var arr = new Array(types.uint.read(state)),
		j
	for (j = 0; j < arr.length; j++) {
		arr[j] = type.read(state)
	}
	return arr
}