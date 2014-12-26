/*globals describe, it*/
'use strict'

var Type = require('../lib/Type'),
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

		assert.deepEqual(myType, {
			__proto__: Type.prototype,
			type: Type.TYPE.OBJECT,
			fields: [{
				name: 'a',
				optional: false,
				array: false,
				type: {
					type: Type.TYPE.INT
				}
			}, {
				name: 'b',
				optional: false,
				array: true,
				type: {
					type: Type.TYPE.INT
				}
			}, {
				name: 'c',
				optional: false,
				array: true,
				type: {
					type: Type.TYPE.OBJECT,
					fields: [{
						name: 'd',
						optional: true,
						array: false,
						type: {
							type: Type.TYPE.STRING
						}
					}]
				}
			}]
		})
	})

	it('should not encode a non conforming object', function () {
		should(function () {
			myType.encode(12)
		}).throw()

		should(function () {
			myType.encode({
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
		encoded = myType.encode(obj)
	})

	it('should read back the data', function () {
		myType.decode(encoded).should.be.eql({
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
	
	it('should encode an array', function () {
		var intArray = new Type(['int'])
		intArray.decode(intArray.encode([])).should.be.eql([])
		intArray.decode(intArray.encode([3])).should.be.eql([3])
		intArray.decode(intArray.encode([3, 14, 15])).should.be.eql([3, 14, 15])
		
		var objArray = new Type([{
			v: 'int',
			f: 'string'
		}])
		objArray.decode(objArray.encode([])).should.be.eql([])
		var data = [{
			v: 1,
			f: 'one'
		}, {
			v: 2,
			f: 'two'
		}]
		objArray.decode(objArray.encode(data)).should.be.eql(data)
	})
})