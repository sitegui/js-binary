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
import { BinaryCodec, Type } from 'typescript-binary';

// Define:
const UserCodec = new BinaryCodec<MyUserInterface>({
  name: {
    first: Type.String,
    last: Type.String
  },
  pass: Type.Buffer,
  creationDate: Type.Date,
  active: Type.Boolean,
  achievements: [Type.UInt], // array of unsigned integers
  'optionalField?': Type.Int
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

## Types

### Primitives
* `Type.Int`: signed integer (between `-Number.MAX_SAFE_INTEGER` and `Number.MAX_SAFE_INTEGER`).
* `Type.UInt`: unsigned integer (between 0 and `Number.MAX_SAFE_INTEGER`),
* `Type.Int8`, `Type.Int16`, `Type.Int32`: signed integers (1, 2 or 4 bytes).
* `Type.UInt8`, `Type.UInt16`, `Type.UInt32`: unsigned integers (1, 2 or 4 bytes).
* `Type.Float`: a 32-bit precision floating-point number.
* `Type.Double`: a 64-bit precision floating-point number (this is default for JavaScript's `number` type).
* `Type.String`: a UTF-8 encoded string.
* `Type.Boolean`: a boolean.

> `Type.UInt` and `Type.Int` will dynamically encode values as 1, 2, 4, or 8 bytes. See [Type.Int](https://github.com/reececomo/typescript-binary/blob/main/src/lib/Type.ts) for limits.

### Advanced
* `Type.BooleanArray`: A packed array of booleans (any length), encoded together (you can pack many booleans into one byte).
* `Type.Buffer`: a Buffer instance
* `Type.RegExp`: a JavaScript `RegExp` object
* `Type.Date`: a JavaScript `Date` object
* `Type.JSON`: Any data supported by [JSON format](http://json.org/). See below for more details.
* `Type.Bitmask8`, `Type.Bitmask16`, and `Type.Bitmask32`: A fixed-length array of booleans, encoded as a `uint8`, `uint16` or `uint32`.

### Objects
Nested data-types.

Examples:

```ts
profile: {
  name: Type.String,
  dateOfBirth: Type.Date
}
```

### Arrays
An array type in which every element has the same data schema.

Example:

```ts
names: [Type.String],
profiles: [{
  name: Type.String,
  dateOfBirth: Type.Date
}]
```

### Optionals
Define the names of properties with a `'?'` on the end to mark a field as optional.

Example:

```ts
{
  a: Type.String,
  'b?': [{ 'c?': Type.Int }],
}
```

### JSON type
As stated before, `typescript-binary` requires the data to have a rather strict schema. But sometimes, part of the data may not fit this reality. In this case, you can fallback to JSON. You will lose the core benefits of binary, but you will gain flexibility.

## Spec
The binary format spec is documented in the [FORMAT.md](./FORMAT.md) file
