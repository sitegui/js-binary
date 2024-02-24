/// <reference types="node" />
import { Field } from './Field';
import { MutableBuffer } from './MutableBuffer';
import { ReadState } from './ReadState';
import { CoderType } from './CoderType';
/** Types used in definitions */
export type BinaryCodecDefinition = CoderType | [CoderType] | Object | Object[];
/**
 * A binary buffer encoder/decoder.
 */
export declare class BinaryCodec<T = any> {
    readonly type: CoderType;
    readonly fields: Field[];
    readonly subBinaryCodec?: BinaryCodec<T>;
    constructor(type: BinaryCodecDefinition);
    /**
     * Encode data to binary.
     *
     * @throws if the value is invalid
     */
    encode(value: T): Buffer;
    /**
     * Decode data.
     *
     * @throws if fails (e.g. binary data is incompatible with schema).
     */
    decode(buffer: Buffer): T;
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
    * @param {BinaryCodec} type
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
    * @param {BinaryCodec} type
    * @param {ReadState} state
    * @return {Array}
    * @throws - if invalid
    * @private
    */
    private _readArray;
}
export default BinaryCodec;
//# sourceMappingURL=BinaryCodec.d.ts.map