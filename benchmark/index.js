'use strict'

var data = require('./data'),
	Type = require('../lib/Type'),
	then, json, jsonTime, jsBinaryTime, jsBinary, reduction

// Declare schema
var stat = {
	length: 'uint',
	min: 'uint',
	q1: 'uint',
	median: 'uint',
	q3: 'uint',
	max: 'uint',
	total: 'uint',
	avg: 'float'
}
var type = new Type({
	data: [{
		date: 'date',
		stats: {
			a: stat,
			b: stat,
			c: stat,
			d: stat,
			e: stat
		}
	}]
})

console.log('Encode')
console.log('\tJSON')
then = Date.now()
for (var i = 0; i < 1e3; i++) {
	json = JSON.stringify(data)
}
jsonTime = (Date.now() - then) / 1e3
console.log('\t\tTime: %dms', jsonTime)
console.log('\t\tSize: %dKiB', json.length >> 10)

console.log('\tjs-binary')
then = Date.now()
for (var i = 0; i < 1e3; i++) {
	jsBinary = type.encode(data)
}
jsBinaryTime = (Date.now() - then) / 1e3
console.log('\t\tTime: %dms (%d%%)', jsBinaryTime, Math.round(100 * jsBinaryTime / jsonTime - 100))
reduction = json.length / jsBinary.length
console.log('\t\tSize: %dKiB (%dx less)', jsBinary.length >> 10, Math.round(reduction * 10) / 10)

console.log('Decode')
console.log('\tJSON')
then = Date.now()
for (var i = 0; i < 1e3; i++) {
	JSON.parse(json)
}
jsonTime = (Date.now() - then) / 1e3
console.log('\t\tTime: %dms', jsonTime)

console.log('\tjs-binary')
then = Date.now()
for (var i = 0; i < 1e3; i++) {
	type.decode(jsBinary)
}
jsBinaryTime = (Date.now() - then) / 1e3
console.log('\t\tTime: %dms (%d%%)', jsBinaryTime, Math.round(100 * jsBinaryTime / jsonTime - 100))