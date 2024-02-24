import {
  BinaryCodec,
  Type,
} from '../src/index';

describe('BinaryCodec', function () {
  const MyBinaryCodec = new BinaryCodec({
    a: 'int',
    b: ['int'],
    c: [{
      'd?': 'str'
    }]
  });

  const validData = {
    a: 22,
    b: [-3, 14, -15, 92, -65, 35],
    c: [
      {
        d: 'Hello World'
      },
      {},
      {
        d: '?'
      },
    ]
  };

  it('should correctly parse a type', function () {
    expect(MyBinaryCodec).toEqual({
      __proto__: BinaryCodec.prototype,
      type: Type.Object,
      fields: [
        {
          name: 'a',
          isOptional: false,
          isArray: false,
          type: {
            type: Type.Int
          }
        },
        {
          name: 'b',
          isOptional: false,
          isArray: true,
          type: {
            type: Type.Int
          }
        },
        {
          name: 'c',
          isOptional: false,
          isArray: true,
          type: {
            type: Type.Object,
            fields: [
              {
                name: 'd',
                isOptional: true,
                isArray: false,
                type: {
                  type: Type.String
                }
              }
            ]
          }
        }
      ]
    })
  })

  it('should not encode a non conforming object', function () {
    expect(() => {
      MyBinaryCodec.encode(12)
    }).toThrow();

    expect(() => {
      MyBinaryCodec.encode({
        a: 17,
        b: [],
        c: [{
          d: true
        }]
      })
    }).toThrow();
  })

  it('should encode a conforming object and read back the data', function () {
    const encoded = MyBinaryCodec.encode(validData);
    const decoded = MyBinaryCodec.decode(encoded);

    expect(decoded).toEqual(validData);
  })
  
  it('should encode an array', function () {
    const intArray = new BinaryCodec(['int'])
    expect(intArray.decode(intArray.encode([]))).toEqual([])
    expect(intArray.decode(intArray.encode([3]))).toEqual([3])
    expect(intArray.decode(intArray.encode([3, 14, 15]))).toEqual([3, 14, 15])
    
    const objArray = new BinaryCodec([{
      v: 'int',
      f: 'str'
    }])
    expect(objArray.decode(objArray.encode([]))).toEqual([])
    const data = [{
      v: 1,
      f: 'one'
    }, {
      v: 2,
      f: 'two'
    }]
    expect(objArray.decode(objArray.encode(data))).toEqual(data)
  })
});


describe('BOOLEAN_ARRAY', () => {
  const MyCoder = new BinaryCodec({
    name: Type.String,
    coolBools: Type.BooleanArray,
  });

  it('should encode less than 8', () => {
    const before = {
      name: 'my awesome example string',
      coolBools: [false, true, false, true, false],
    };

    const encoded = MyCoder.encode(before);

    const after = MyCoder.decode(encoded);
    expect(after).toStrictEqual({
      name: 'my awesome example string',
      coolBools: [false, true, false, true, false],
    });
    
    expect(before.coolBools.length).toBe(after.coolBools.length);
  });

  it('should encode any number of bools', () => {
    const before = {
      name: 'my awesome example string',
      coolBools: [
        false, false, true, false, true, false, true, false, true,
        false, false, true, false, true, false, true, false, true,
        false, false, true, false, true, false, true, false, true,
        false, false, true, false, true, false, true, false, true,
        false, false, true, false, true, false, true, false, true,
      ],
    };

    const encoded = MyCoder.encode(before);

    const after = MyCoder.decode(encoded);
    expect(after).toStrictEqual({
      name: 'my awesome example string',
      coolBools: [
        false, false, true, false, true, false, true, false, true,
        false, false, true, false, true, false, true, false, true,
        false, false, true, false, true, false, true, false, true,
        false, false, true, false, true, false, true, false, true,
        false, false, true, false, true, false, true, false, true,
      ],
    });
    
    expect(before.coolBools.length).toBe(45);
    expect(after.coolBools.length).toBe(45);
  });
});

describe('BITMASK_8', () => {
  const MyCoder = new BinaryCodec({
    name: Type.String,
    coolBools: Type.Bitmask8,
  });

  it('should encode all booleans below the minimum allowed', () => {
    const before = {
      name: 'my awesome example string',
      coolBools: [true, false, true],
    };

    const encoded = MyCoder.encode(before);

    const after = MyCoder.decode(encoded);
    expect(after).toStrictEqual({
      name: 'my awesome example string',
      coolBools: [true, false, true, false, false, false, false, false],
    });
    
    expect(after.coolBools.length).toBe(8);
  });

  it('should encode up to the maximum boolean array', () => {
    const before = {
      name: 'my awesome example string',
      coolBools: [false, false, true, false, true, false, true, false, true],
    };

    const encoded = MyCoder.encode(before);

    const after = MyCoder.decode(encoded);
    expect(after).toStrictEqual({
      name: 'my awesome example string',
      coolBools: [false, false, true, false, true, false, true, false],
    });
    
    expect(before.coolBools.length).toBe(9);
    expect(after.coolBools.length).toBe(8);
  });
});

describe('BITMASK_32', () => {
  const MyCoder = new BinaryCodec({
    name: Type.String,
    coolBools: Type.Bitmask32,
    other: Type.String,
  });

  it('should encode all booleans below the minimum allowed', () => {
    const before = {
      name: 'my awesome example string',
      coolBools: [false, true, true, false, false,],
      other: 'hmm',
    };

    const encoded = MyCoder.encode(before);

    const after = MyCoder.decode(encoded);
    expect(after).toStrictEqual({
      name: 'my awesome example string',
      coolBools: [
        false, true, true, false, false, false, false, false,
        false, false, false, false, false, false, false, false,
        false, false, false, false, false, false, false, false,
        false, false, false, false, false, false, false, false
      ],
      other: 'hmm',
    });
    
    expect(after.coolBools.length).toBe(32);
  });

  it('should encode up to the maximum boolean array', () => {
    const before = {
      name: 'my awesome example string',
      coolBools: [
        true, false, true, false, true, false, true, false,
        true, false, true, false, true, false, true, false,
        true, false, true, false, true, false, true, false,
        true, false, true, false, true, false, true, false,
        true, true, true,
      ],
      other: 'hmm',
    };

    const encoded = MyCoder.encode(before);

    const after = MyCoder.decode(encoded);
    expect(after).toStrictEqual({
      name: 'my awesome example string',
      coolBools: [
        true, false, true, false, true, false, true, false,
        true, false, true, false, true, false, true, false,
        true, false, true, false, true, false, true, false,
        true, false, true, false, true, false, true, false,
      ],
      other: 'hmm',
    });
    
    expect(before.coolBools.length).toBe(35);
    expect(after.coolBools.length).toBe(32);
  });
});
