import {
  MutableBuffer,
  ReadState,
  coders
} from '../src/index';

import uintValues from './uint.json';
import intValues from './int.json';

describe('types', function () {
  const coder = coders.uintCoder;

  it('should correctly convert auto uints', function () {
    Object.keys(uintValues).forEach(function (rawValue) {
      const value = Number(rawValue)

      const encoded = writeBuffer(coder, value);
      const expected = uintValues[value];
      expect(encoded.toString('hex')).toEqual(expected.hex);
      expect(`${value}: ${encoded.byteLength}`).toEqual(`${value}: ${expected.bytes}`);

      const decoded: number = readBuffer(coder, encoded);
      expect(decoded).toEqual(value);
    });
  })

  it('should correctly convert auto ints', function () {
    const coder = coders.intCoder;

    Object.keys(intValues).forEach(function (rawValue) {
      const value = Number(rawValue)

      const encoded = writeBuffer(coder, value);
      const expected = intValues[value];
      expect(encoded.toString('hex')).toEqual(expected.hex);
      expect(`${value}: ${encoded.byteLength}`).toEqual(`${value}: ${expected.bytes}`);

      const decoded: number = readBuffer(coder, encoded);
      expect(decoded).toEqual(value);
    });
  })

  it('should correctly convert int8', function () {
    const coder = coders.int8Coder;
    
    [0, 1, 2, 100, 127, -1, -2, -100, -127].forEach((value: number): void => {
      const encoded = writeBuffer(coder, value);
      expect(encoded.byteLength).toBe(1);
      const decoded: number = readBuffer(coder, encoded);
      expect(decoded).toEqual(value);
    });
  })

  it('should correctly convert int16', function () {
    const coder = coders.int16Coder;
    
    [0, 1, -1, 128, -128, 32_767, -32_767].forEach((value: number): void => {
      const encoded = writeBuffer(coder, value);
      expect(encoded.byteLength).toBe(2);
      const decoded: number = readBuffer(coder, encoded);
      expect(decoded).toEqual(value);
    });
  })

  it('should correctly convert int32', function () {
    const coder = coders.int32Coder;
    
    [0, 1, -1, 32_767, -32_767, 32_768, -2_147_483_647, 2_147_483_647].forEach((value: number): void => {
      const encoded = writeBuffer(coder, value);
      expect(encoded.byteLength).toBe(4);
      const decoded: number = readBuffer(coder, encoded);
      expect(decoded).toEqual(value);
    });
  })

  it('should correctly convert uint8', function () {
    const coder = coders.uint8Coder;
    
    [0, 1, 2, 100, 127, 254, 255].forEach((value: number): void => {
      const encoded = writeBuffer(coder, value);
      expect(encoded.byteLength).toBe(1);
      const decoded: number = readBuffer(coder, encoded);
      expect(decoded).toEqual(value);
    });
  })

  it('should correctly convert uint16', function () {
    const coder = coders.uint16Coder;
    
    [0, 256, 65_535].forEach((value: number): void => {
      const encoded = writeBuffer(coder, value);
      expect(encoded.byteLength).toBe(2);
      const decoded: number = readBuffer(coder, encoded);
      expect(decoded).toEqual(value);
    });
  })

  it('should correctly convert uint32', function () {
    const coder = coders.uint32Coder;
    
    [0, 255, 65_536, 4_294_967_295].forEach((value: number): void => {
      const encoded = writeBuffer(coder, value);
      expect(encoded.byteLength).toBe(4);
      const decoded: number = readBuffer(coder, encoded);
      expect(decoded).toEqual(value);
    });
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

  it('should be sound for regex', function () {
    check(coders.regexCoder, /my-regex/)
    check(coders.regexCoder, /^\.{3,}[\]\[2-5-]|(?:2)$/ig)
  })

  it('should be sound for date', function () {
    check(coders.dateCoder, new Date)
  })
})

function writeBuffer<T>(coder: any, value: T): Buffer {
  var data = new MutableBuffer();
  coder.write(value, data, '')
  return data.toBuffer()
}

function readBuffer<T>(coder: any, buffer: Buffer): T {
  var state = new ReadState(buffer),
    r = coder.read(state)
  expect(state.hasEnded()).toBe(true);
  return r
}

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