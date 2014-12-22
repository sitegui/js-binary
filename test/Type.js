/*globals describe, it*/
'use strict'

var Type = require('../lib/Type'),
	ReadState = require('../lib/ReadState'),
	should = require('should'),
	assert = require('assert')

describe('Type', function () {
	var myType

	it('should correctly parse a type', function () {
		myType = new Type({
			a: 'int',
			b: ['int'],
			c: [{
				'd?': 'string'
			}]
		})

		// should().eql() was also checking prototype here...
		assert.deepEqual(myType, {
			type: Type.OBJECT,
			fields: [{
				name: 'a',
				optional: false,
				array: false,
				type: {
					type: Type.INT
				}
			}, {
				name: 'b',
				optional: false,
				array: true,
				type: {
					type: Type.INT
				}
			}, {
				name: 'c',
				optional: false,
				array: true,
				type: {
					type: Type.OBJECT,
					fields: [{
						name: 'd',
						optional: true,
						array: false,
						type: {
							type: Type.STRING
						}
					}]
				}
			}]
		})
	})

	it('should not encode a non conforming object', function () {
		should(function () {
			myType.writeIntoBuffer(12)
		}).throw()

		should(function () {
			myType.writeIntoBuffer({
				a: 17,
				b: [],
				c: [{
					d: true
				}]
			})
		}).throw()
	})

	var obj = {
			a: 22,
			b: [-3, 14, -15, 92, -65, 35],
			c: [{
				d: 'Hello World'
			}, {}, {
				d: '?'
			}]
		},
		encoded

	it('should encode a conforming object', function () {
		encoded = myType.writeIntoBuffer(obj)
	})

	it('should read back the data', function () {
		myType.read(new ReadState(encoded)).should.be.eql({
			a: 22,
			b: [-3, 14, -15, 92, -65, 35],
			c: [{
				d: 'Hello World'
			}, {
				d: undefined
			}, {
				d: '?'
			}]
		})
	})
})