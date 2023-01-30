import {
  MutableBuffer,
  ReadState,
  coders
} from '../src/index';

import uintValues from './uint.json';
import intValues from './int.json';

describe('types', function () {
	it('should correctly convert uints', function () {
		Object.keys(uintValues).forEach(function (rawValue) {
			const value = Number(rawValue)
			var encoded = write(coders.uintCoder, value)
			expect(encoded).toEqual(uintValues[value])
			expect(read(encoded, coders.uintCoder)).toEqual(value)
		})
	})

	it('should correctly convert ints', function () {
		Object.keys(intValues).forEach(function (rawValue) {
			const value = Number(rawValue);
			var encoded = write(coders.intCoder, value)
			expect(encoded).toEqual(intValues[value])
			expect(read(encoded, coders.intCoder)).toEqual(value)
		})
	})

	it('should be sound for double precision floats', function () {
		check(coders.float64Coder, 0)
		check(coders.float64Coder, 3.14)
		check(coders.float64Coder, -Math.E)
		check(coders.float64Coder, Infinity)
		check(coders.float64Coder, -Infinity)
		check(coders.float64Coder, 1 / Infinity)
		check(coders.float64Coder, -1 / Infinity)
		check(coders.float64Coder, NaN)
	})

	it('should be sound for single precision floats', function () {
		check(coders.float32Coder, 0)
		check(coders.float32Coder, 0.5)
		check(coders.float32Coder, 1)
		check(coders.float32Coder, Infinity)
		check(coders.float32Coder, -Infinity)
		check(coders.float32Coder, 1 / Infinity)
		check(coders.float32Coder, -1 / Infinity)
		check(coders.float32Coder, NaN)
	})

	it('should be sound for string', function () {
		check(coders.stringCoder, '')
		check(coders.stringCoder, 'Hello World')
		check(coders.stringCoder, '\u0000 Ūnĭcōde \uD83D\uDC04')
	})

	it('should be sound for Buffer', function () {
		check(coders.BufferCoder, Buffer.from([]))
		check(coders.BufferCoder, Buffer.from([3, 14, 15, 92, 65, 35]))
	})

	it('should be sound for boolean', function () {
		check(coders.booleanCoder, true)
		check(coders.booleanCoder, false)
	})

	it('should be sound for json', function () {
		check(coders.jsonCoder, true)
		check(coders.jsonCoder, 17)
		check(coders.jsonCoder, null)
		check(coders.jsonCoder, 'Hello')
		check(coders.jsonCoder, [true, 17, null, 'Hi'])
		check(coders.jsonCoder, {
			a: 2,
			b: {
				c: ['hi']
			}
		})
	})

	it('should be sound for object id', function () {
		check(coders.oidCoder, '123456789012345678901234')
	})

	it('should be sound for regex', function () {
		check(coders.regexCoder, /my-regex/)
		check(coders.regexCoder, /^\.{3,}[\]\[2-5-]|(?:2)$/ig)
	})

	it('should be sound for date', function () {
		check(coders.dateCoder, new Date)
	})
})

/**
 * @param {Object} type
 * @param {*} value
 * @return {string} - hex string
 */
function write(type, value) {
	var data = new MutableBuffer();
	type.write(value, data, '')
	return data.toBuffer().toString('hex')
}

/**
 * @param {string} hexStr
 * @param {Object} type
 * @return {*}
 */
function read(hexStr, type) {
	var state = new ReadState(Buffer.from(hexStr, 'hex')),
		r = type.read(state)
	expect(state.hasEnded()).toBe(true);
	return r
}

/**
 * @param {Object} type
 * @param {*} value
 */
function check(type, value) {
	expect(read(write(type, value), type)).toEqual(value);
}