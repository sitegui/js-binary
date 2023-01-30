import {
  Schema,
	CoderType,
} from '../src/index';

describe('Schema', function () {
	const MySchema = new Schema({
		a: 'int',
		b: ['int'],
		c: [{
			'd?': 'string'
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
		expect(MySchema).toEqual({
			__proto__: Schema.prototype,
			type: CoderType.OBJECT,
			fields: [
				{
					name: 'a',
					isOptional: false,
					isArray: false,
					type: {
						type: CoderType.INT
					}
				},
				{
					name: 'b',
					isOptional: false,
					isArray: true,
					type: {
						type: CoderType.INT
					}
				},
				{
					name: 'c',
					isOptional: false,
					isArray: true,
					type: {
						type: CoderType.OBJECT,
						fields: [
							{
								name: 'd',
								isOptional: true,
								isArray: false,
								type: {
									type: CoderType.STRING
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
			MySchema.encode(12)
		}).toThrow();

		expect(() => {
			MySchema.encode({
				a: 17,
				b: [],
				c: [{
					d: true
				}]
			})
		}).toThrow();
	})

	it('should encode a conforming object and read back the data', function () {
		const encoded = MySchema.encode(validData);
		const decoded = MySchema.decode(encoded);

		expect(decoded).toEqual(validData);
	})
	
	it('should encode an array', function () {
		const intArray = new Schema(['int'])
		expect(intArray.decode(intArray.encode([]))).toEqual([])
		expect(intArray.decode(intArray.encode([3]))).toEqual([3])
		expect(intArray.decode(intArray.encode([3, 14, 15]))).toEqual([3, 14, 15])
		
		const objArray = new Schema([{
			v: 'int',
			f: 'string'
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
