# TypeScript Binary

Encode/decode custom binary formats from JavaScript, and much smaller and faster than JSON (or BSON).

This project is forked from the fantastic [sitegui/js-binary](https://github.com/sitegui/js-binary) library, written by [Guilherme Souza](https://github.com/sitegui). It works similarly to [Google's Protocol Buffers](https://protobuf.dev/), but with flexible support.

Compatible with [geckos.io](https://github.com/geckosio/geckos.io) (which is like [socket.io](https://github.com/socketio/socket.io) over WebRTC Data Channels).

## Install
`npm install typescript-binary`

`yarn add typescript-binary`

<detail>
<summary><h3>Enable browser support (polyfill required)</h3></summary>

You may also need to polyfill `Buffer`, if using in the browser.

`npm install buffer --save-dev`

For example, in Webpack:

```js
// webpack.config.js

  /* ... */
  resolve: {
    fallback: {
      buffer: require.resolve('buffer/'),
    },
    // ...
  },
  plugins: [
    // Make sure 'buffer' is available.
    new webpack.ProvidePlugin({ Buffer: ['buffer', 'Buffer'] }),
    // ...
  ],
  /* ... */
```

</detail>

## Goal

This module encodes and decodes data to your own custom binary formats (using Buffers), and is analogous to `JSON.stringify(...)` and `JSON.parse(...)`. The format was designed to be very compact and give support for complex types (including `Array`, `Date` and `Buffer`).

To reduce overhead in the format, it carries no information about types. This implies that you must use a shared data schema to encode/decode properly. Huge plus: this automatically validates the data against the given schema (*input sanitization for free!*). This binary format is well suited for very well-defined data, such as data packets for an online game.

Note that, since it's a binary format, it is not meant to be easily viewed/edited by hand.

## Usage
```js
import { BinaryCodec } from 'typescript-binary';

// Define:
const UserCodec = new BinaryCodec<MyUserInterface>({
  name: {
    first: 'string',
    last: 'string'
  },
  pass: 'Buffer',
  creationDate: 'date',
  active: 'boolean',
  achievements: ['uint'], // array of unsigned integers
  'optionalField?': 'int'
});

// Encode:
const myUserBinary: Buffer = UserBinaryCodec.encode({
  name: {
    first: 'Guilherme',
    last: 'Souza'
  },
  pass: Buffer.from('042697a30b2dafbdf91bf66bdacdcba8', 'hex'),
  creationDate: new Date('2014-04-11T21:22:32.504Z'),
  active: true,
  achievements: [3, 14, 15, 92, 65, 35],
});

// Decode:
const myUser: MyUserInterface = UserBinaryCodec.decode(myUserBinary);
```

## Available types
### Primitive types
* 'boolean': a boolean.
* 'uint': unsigned integer (between 0 and 2^53). 
* 'int': signed integer (between -2^53 and 2^53).
* 'float32': a 32-bit precision floating-point number.
* 'float64': a 64-bit precision floating-point number (this is typically the default for JavaScript's `number` type).
* 'string': a UTF-8 encoded string.

> `uint` and `int` use a custom coder that dynamically chooses the smallest encoding for the given value (e.g. 8-32 bytes).

### Advanced types
* 'Buffer': a Buffer instance
* 'regex': a JavaScript `RegExp` object
* 'date': a JavaScript `Date` object
* 'json': Any data supported by [JSON format](http://json.org/). See below for more details.
* 'booleans': An array of booleans (any length), encoded with a 2-bit header.
* 'bitmask8', 'bitmask16', and 'bitmask32': A fixed-length tuple of booleans, encoded as a `uint8`, `uint16` or `uint32`.

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
As stated before, `typescript-binary` requires the data to have a rather strict schema. But sometimes, part of the data may not fit this reality. In this case, you can fallback to JSON. You will lose the core benefits of binary, but you will gain flexibility.

## Spec
The binary format spec is documented in the [FORMAT.md](./FORMAT.md) file
