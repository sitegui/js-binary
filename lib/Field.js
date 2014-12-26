'use strict'

var Type

/**
 * Parse and represent an object field. See example in Type.js
 * @class
 * @param {string} name
 * @param {string|Object|Array<string>|Array<Object>} type
 */
function Field(name, type) {
	/** @member {boolean} */
	this.optional = false

	if (name[name.length - 1] === '?') {
		this.optional = true
		name = name.substr(0, name.length - 1)
	}

	/** @member {string} */
	this.name = name

	/** @member {boolean} */
	this.array = Array.isArray(type)

	if (this.array) {
		if (type.length !== 1) {
			throw new TypeError('Invalid array type, it must have exactly one element')
		}
		type = type[0]
	}

	/** @member {Type} */
	this.type = new Type(type)
}

module.exports = Field

Type = require('./Type')