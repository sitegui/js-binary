# TypeScript Binary

Fork of [sitegui/js-binary](https://github.com/sitegui/js-binary) updated to TypeScript, and with new types.

> Encode/decode to a custom binary format, much more compact and faster than JSON/BSON.

## Install
`npm install typescript-binary`

## Goal
This module is analogous to `JSON.stringify` and `JSON.parse`, but instead of a JSON string, the data is encoded to a custom binary format (using a Buffer instance to store the data).
This format was designed to be very *compact* and give support for *more types* (like Date and Buffer).

To reduce overhead in the format, it carries no information about types. This implies that you must define the data schema to encode/decode properly. Huge plus: this automatically validates the data against the given schema (*input sanitization for free!*). This binary format is well suited for very regular data, like API input/output.

Note that, since it's a binary format, it was not meant to be easily viewed/edited by hand.

## Usage
```js
const user = {
	name: {
		first: 'Guilherme',
		last: 'Souza'
	},
	pass: Buffer.from('042697a30b2dafbdf91bf66bdacdcba8', 'hex'),
	creationDate: new Date('2014-04-11T21:22:32.504Z'),
	active: true,
	achievements: [3, 14, 15, 92, 65, 35]
}

import { Schema } from 'typescript-binary';

const UserSchema = new Schema({
	name: {
		first: 'string',
		last: 'string'
	},
	pass: 'Buffer',
	creationDate: 'date',
	active: 'boolean',
	achievements: ['uint'], // array of unsigned ints
	'optionalField?': 'int',
});

const encoded = UserSchema.encode(user);
const decoded = UserSchema.decode(encoded);
```

## Available types
### Basic types
* 'uint': unsigned integer (between 0 and 2^53)
* 'int': signed integer (between -2^53 and 2^53)
* 'float32': a 32-bit floating-point
* 'float64': a 64-bit floating-point (the JavaScript `number` type)
* 'string': a utf-8 string
* 'Buffer': a Buffer instance
* 'boolean': a boolean
* 'regex': a JS RegExp instance
* 'date': a JS Date instance
* 'json': any data supported by [JSON format](http://json.org/). Read bellow for more
* 'oid': mongodb ObjectId (see bellow)

### Compound types
A compound type is an object with (optional) fields. Those fields may be arrays, but with the restriction that every element has the same data schema.

Examples:

* Nested fields: `{a: {b: 'int', d: {e: 'int'}}}`
* Optional fields: `{a: 'int', 'b?': 'int', 'c?': {d: 'int'}}`
* Array fields: `{a: ['int']}`
* All together now: `{'a?': [{'b?': 'int'}]}`

### Array type
An array type in which every element has the same data schema.

Examples:

* Int array: `['int']`
* Object array: `[{v: 'int', f: 'string'}]`

### JSON type
As stated before, the js-binary requires the data to have a rather strict schema. But sometimes, part of the data may not fit this reality. In this case, you can fallback to JSON :)

Of course, a JSON field will miss the point about space efficiency and data validation, but will gain in flexibility.

### ObjectId type
js-binary gives first-class support for mongodb ObjectId. But since js-binary doesn't (and shouldn't) depend on any peculiar mongodb driver, the rules for this type are:

* Encoding: any object `o` is accepted, as long `Buffer.from(String(o), 'hex')` yields a 12-byte Buffer
* Decoding: returns a 24-char hex-encoded string

This should be compatible with most ObjectId implementations on the wild

## Spec
The binary format spec is documented in the [FORMAT.md](./FORMAT.md) file
