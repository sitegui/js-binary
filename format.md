# Binary format
This file describes how data is encoded to binary and explain some rationale behind them.

## Endianess
Everything uses big-endian

## Basic types

### uint
An unsigned integer, stored in a variable number of bytes, depending on its value. This behavior lets small values (like `17`) fit in one byte and, at the same time, give support to (almost) 64 bits integers. Another advantage is that the user doesn't need to care about fixing the field size.

The down-sides of this design are:
* a more complex encoding/decoding process
* lost of compatibily with most tools due to this rather rare encoding.

The first matching rule from the list bellow should be used. This means, for example, encoding `0` with 16 bits is invalid.

* Integers greater or equal to `0` and less than `2^7=128` are encoded as `uint8`:  
`0xxx xxxx` (each char is a bit, `x` is either 0 or 1)
* Integers less than `2^14=16384` are encoded as `uint16`, but with the first bit set:  
`10xx xxxx  xxxx xxxx`
* Integers less than `2^29=536870912` are encoded as `uint32`, but with the first 2 bits set:  
`110x xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx`
* Integers less than `2^61=2305843009213693952` are encoded as `uint64`, but with the first 3 bits set:
`111x xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx`
* Any other value should be treated as an error

### int
A signed integer, store in a variable number of bytes.

The first matching rule from the list bellow should be used. This means, for example, encoding `0` with 16 bits is invalid.

* Integers greater or equal to `-2^6=-64` and less than `2^6` are encoded as `int8`, but with the first bit unset:  
`0xxx xxxx` (each char is a bit, `x` is either 0 or 1)
* Integers greater or equal to `-2^13=-8192` and less than `2^13` are encoded as `int16`, but with the first bit set and the second unset:  
`10xx xxxx  xxxx xxxx`
* Integers greater or equal to `-2^28=-268435456` and less than `2^28` are encoded as `int32`, but with the first 2 bits set and the third unset:  
`110x xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx`
* Integers greater or equal to `-2^60=-1152921504606846976` and less than `2^60` are encoded as `int64`, but with the first 3 bits set:
`111x xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx`
* Any other value should be treated as an error

### float
A 64-bit floating point, many times referred to as `double`, as spec'ed in IEEE 754

### string
An unicode text string. It should be first converted into bytes (as spec'ed by UTF-8) and then encoded as `Buffer` (see bellow)

### Buffer
A sequence of octets (bytes). First, the Buffer length (in bytes), `len`, is encoded as `uint` (see above) and appended to the result. After that, `len` bytes follow (the Buffer content):
`<uint_length> <buffer_data>`

### boolean
Either `true`, encoded as the byte `0x01`, or `false`, encoded as `0x00`.

### json
Any JSON-compatible data. First the value is transformed in string by a JSON serialization algorithm (like `JSON.stringify`). The resulting string is the encoded as a `string` (see above).

### oid
A mongodb ObjectId, composed of 12 bytes. No encoding is actually needed, the 12 bytes are simply appended to the final result.

### regex
A JS-compatible regular expression, composed of:

* `source`: the regex source as a string (as returned by the `source` property in a `RegExp` instance);
* `flags`: a set from the universe `{g, i, m}`. That is, each of those 3 flags are active or not.

First, the `source` is encoded as a `string`. After that, is appended the flag byte. The flag byte is a bit-mask: `0000 0mig`.

### date
A date value, represented by a UNIX timestamp in milliseconds, encoded as a `uint`.

## Compound type
A compound type is an ordered sequence of `fields`. Each `field` has three properties:

* its type
* whether it's optional or not
* whether it's an array or a single value

For each `field` (following in order):

1. if it's optional
	1. if the value is `empty` (see bellow)
		1. append the `boolean` `false`
		2. continue to next field.
	2. else
		1. append the `boolean` `true`
2. if it's a single value
	1. append `value` encoded as defined by the field's `type`
	2. continue to next field
3. get the the array length `len`
4. append `len` encoded as an `uint`
5. append each `value` in the array, encoded as defined by the field's `type`

### empty
A value is said to be `empty` if it's an equivalent of `undefined` or `null`. Empty string, empty array, empty Buffers, empty object, zeros, NaN, Infinity, etc are *NOT* said to be `empty`