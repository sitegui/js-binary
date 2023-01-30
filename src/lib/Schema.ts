import * as coders from './coders';
import { Field } from './Field';
import { MutableBuffer } from './MutableBuffer';
import { ReadState } from './ReadState';

export enum CoderType {
	UINT = 'uint',
	INT = 'int',
	FLOAT_32 = 'float32',
	FLOAT_64 = 'float64',
	STRING = 'string',
	BUFFER = 'Buffer',
	BOOLEAN = 'boolean',
	JSON = 'json',
	OID = 'oid',
	REGEX = 'regex',
	DATE = 'date',
	ARRAY = '[array]',
	OBJECT = '{object}',
}

/** Types used in definitions */
export type SchemaDefinition = CoderType | [CoderType] | Object | Object[];

/**
 * Create a Schema, given a definition.
 */
export class Schema {
	readonly type: CoderType;
	readonly fields: Field[]
	readonly subSchema?: Schema;

	constructor(type: SchemaDefinition) {
		if (Array.isArray(type)) {
			if (type.length !== 1) {
				throw new TypeError('Invalid array type, it must have exactly one element')
			}

			this.type = CoderType.ARRAY;
			this.subSchema = new Schema(type[0]);
		} else if (typeof type === 'object') {
			this.type = CoderType.OBJECT
			this.fields = Object.keys(type).map(function (name) {
				return new Field(name, type[name])
			})
		} else if (type !== undefined) {
			this.type = type;
		} else {
			throw new Error("Invalid type given. Must be array containing a single type, an object, or a known coder type.");
		}
	}

	/**
	 * @param {*} value
	 * @return {Buffer}
	 * @throws if the value is invalid
	 */
	public encode(value: any) {
		var data = new MutableBuffer();
		this.write(value, data, '')
		return data.toBuffer()
	}

	/**
	 * @param {Buffer} buffer
	 * @return {*}
	 * @throws if fails
	 */
	public decode(buffer: Buffer): any {
		return this.read(new ReadState(buffer))
	}

	/**
	 * @param {*} value
	 * @param {MutableBuffer} data
	 * @param {string} path
	 * @throws if the value is invalid
	 */
	public write(value: { [x: string]: any; }, data: MutableBuffer, path: string) {
		var i: number, field: Field, subpath: any, subValue: any, len: number

		if (this.type === CoderType.ARRAY) {
			// Array field
			return this._writeArray(value as any, data, path, this.subSchema)
		} else if (this.type !== CoderType.OBJECT) {
			// Simple type
			return coders.getCoder(this.type).write(value, data, path)
		}

		// Check for object type
		if (!value || typeof value !== 'object') {
			throw new TypeError('Expected an object at ' + path)
		}

		// Write each field
		for (i = 0, len = this.fields.length; i < len; i++) {
			field = this.fields[i]
			subpath = path ? path + '.' + field.name : field.name
			subValue = value[field.name]

			if (field.isOptional) {
				// Add 'presence' flag
				if (subValue === undefined || subValue === null) {
					coders.booleanCoder.write(false, data)
					continue
				} else {
					coders.booleanCoder.write(true, data)
				}
			}

			if (!field.isArray) {
				// Scalar field
				field.type.write(subValue, data, subpath)
				continue
			}

			// Array field
			this._writeArray(subValue, data, subpath, field.type)
		}
	}

	/**
	 * @param {*} value
	 * @param {MutableBuffer} data
	 * @param {string} path
	 * @param {Schema} type
	 * @throws if the value is invalid
	 * @private
	 */
	private _writeArray(value: string | any[], data: any, path: string, type: Schema) {
		var i: string | number, len: number
		if (!Array.isArray(value)) {
			throw new TypeError('Expected an Array at ' + path)
		}
		len = value.length
		coders.uintCoder.write(len, data)
		for (i = 0; i < len; i++) {
			type.write(value[i], data, path + '.' + i)
		}
	}

	/**
	 * This funciton will be executed only the first time
	 * After that, we'll compile the read routine and add it directly to the instance
	 * @param {ReadState} state
	 * @return {*}
	 * @throws if fails
	 */
	public read(state: ReadState) {
		this.read = this._compileRead()
		return this.read(state)
	}

	/**
	 * Return a signature for this type. Two types that resolve to the same hash can be said as equivalents
	 * @return {Buffer}
	 */
	public getHash() {
		var hash = new MutableBuffer
		hashType(this, false, false)
		return hash.toBuffer()

		/**
		 * @param {Schema} type
		 * @param {boolean} array
		 * @param {boolean} optional
		 */
		function hashType(type: Schema, array: boolean, isOptional: boolean) {
			// Write type (first char + flags)
			// AOxx xxxx
			hash.writeUInt8((this.type.charCodeAt(0) & 0x3f) | (array ? 0x80 : 0) | (isOptional ? 0x40 : 0))

			if (this.type === CoderType.ARRAY) {
				hashType(type.subSchema, false, false)
			} else if (this.type === CoderType.OBJECT) {
				coders.uintCoder.write(type.fields.length, hash)
				type.fields.forEach((f) => hashType(f.type, f.isArray, f.isOptional));
			}
		}
	}

	public _readOptional(state: ReadState): boolean {
		return coders.booleanCoder.read(state);
	}

	/**
	 * Compile the decode method for this object
	 * @return {function(ReadState):*}
	 * @private
	 */
	private _compileRead() {
		if (this.type !== CoderType.OBJECT && this.type !== CoderType.ARRAY) {
			// Scalar type
			// In this case, there is no need to write custom code
			return coders.getCoder(this.type).read
		} else if (this.type === CoderType.ARRAY) {
			return this._readArray.bind(this, this.subSchema)
		}

		// As an example, compiling code to new Type({a:'int', 'b?':['string']}) will result in:
		// return {
		//     a: this.fields[0].type.read(state),
		//     b: this._readOptional(state) ? this._readArray(state, this.fields[1].type) : undefined
		// }
		var code = 'return {' + this.fields.map(function (field, i) {
			var name = JSON.stringify(field.name),
				fieldStr = 'this.fields[' + i + ']',
				readCode: string, code: string

			if (field.isArray) {
				readCode = 'this._readArray(' + fieldStr + '.type, state)'
			} else {
				readCode = fieldStr + '.type.read(state)'
			}

			if (!field.isOptional) {
				code = name + ': ' + readCode
			} else {
				code = name + ': this._readOptional(state) ? ' + readCode + ' : undefined'
			}
			return code
		}).join(',') + '}'

		return new Function('state', code)
	}

	/**
	 * @param {Schema} type
	 * @param {ReadState} state
	 * @return {Array}
	 * @throws - if invalid
	 * @private
	 */
	private _readArray(type: { read: (arg0: any) => any; }, state: any) {
		var arr = new Array(coders.uintCoder.read(state)),
			j: number
		for (j = 0; j < arr.length; j++) {
			arr[j] = type.read(state)
		}
		return arr
	}
}

export default Schema;
