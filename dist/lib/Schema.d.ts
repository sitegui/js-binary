/// <reference types="node" />
import { Field } from './Field';
import { MutableBuffer } from './MutableBuffer';
import { ReadState } from './ReadState';
export declare enum CoderType {
    UINT = "uint",
    INT = "int",
    FLOAT_32 = "float32",
    FLOAT_64 = "float64",
    STRING = "string",
    BUFFER = "Buffer",
    BOOLEAN = "boolean",
    JSON = "json",
    OID = "oid",
    REGEX = "regex",
    DATE = "date",
    ARRAY = "[array]",
    OBJECT = "{object}"
}
/** Types used in definitions */
export type SchemaDefinition = CoderType | [CoderType] | Object | Object[];
/**
 * Create a Schema, given a definition.
 */
export declare class Schema {
    readonly type: CoderType;
    readonly fields: Field[];
    readonly subSchema?: Schema;
    constructor(type: SchemaDefinition);
    /**
     * @param {*} value
     * @return {Buffer}
     * @throws if the value is invalid
     */
    encode(value: any): Buffer;
    /**
     * @param {Buffer} buffer
     * @return {*}
     * @throws if fails
     */
    decode(buffer: Buffer): any;
    /**
     * @param {*} value
     * @param {MutableBuffer} data
     * @param {string} path
     * @throws if the value is invalid
     */
    write(value: {
        [x: string]: any;
    }, data: MutableBuffer, path: string): void;
    /**
     * @param {*} value
     * @param {MutableBuffer} data
     * @param {string} path
     * @param {Schema} type
     * @throws if the value is invalid
     * @private
     */
    private _writeArray;
    /**
     * This funciton will be executed only the first time
     * After that, we'll compile the read routine and add it directly to the instance
     * @param {ReadState} state
     * @return {*}
     * @throws if fails
     */
    read(state: ReadState): any;
    /**
     * Return a signature for this type. Two types that resolve to the same hash can be said as equivalents
     * @return {Buffer}
     */
    getHash(): Buffer;
    _readOptional(state: ReadState): boolean;
    /**
     * Compile the decode method for this object
     * @return {function(ReadState):*}
     * @private
     */
    private _compileRead;
    /**
     * @param {Schema} type
     * @param {ReadState} state
     * @return {Array}
     * @throws - if invalid
     * @private
     */
    private _readArray;
}
export default Schema;
//# sourceMappingURL=Schema.d.ts.map